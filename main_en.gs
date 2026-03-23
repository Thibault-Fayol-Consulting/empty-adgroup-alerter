/**
 * --------------------------------------------------------------------------
 * Empty Ad Group Alerter — Google Ads Script
 * --------------------------------------------------------------------------
 * Scans all enabled ad groups for a common misconfiguration: active
 * keywords but zero active ads. These "zombie" ad groups waste budget
 * on clicks that can never show an ad. Optionally pauses them and
 * sends an email alert.
 *
 * Author:  Thibault Fayol — Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,                      // true = log only, false = pause ad groups + send email
  EMAIL: 'contact@domain.com',          // Alert recipient
  PAUSE_EMPTY: true                     // true = pause empty ad groups when TEST_MODE is false
};

function main() {
  try {
    Logger.log('Scanning for ad groups with active keywords but no active ads...');

    var agIter = AdsApp.adGroups()
      .withCondition('Status = ENABLED')
      .withCondition('CampaignStatus = ENABLED')
      .get();

    var emptyGroups = [];
    var totalScanned = 0;

    while (agIter.hasNext()) {
      var ag = agIter.next();
      totalScanned++;

      var numKeywords = ag.keywords()
        .withCondition('Status = ENABLED')
        .get()
        .totalNumEntities();

      var numAds = ag.ads()
        .withCondition('Status = ENABLED')
        .get()
        .totalNumEntities();

      if (numKeywords > 0 && numAds === 0) {
        var info = {
          campaign: ag.getCampaign().getName(),
          adGroup: ag.getName(),
          keywords: numKeywords
        };

        Logger.log('Empty: ' + info.campaign + ' > ' + info.adGroup +
                    ' (' + info.keywords + ' active keywords, 0 ads)');

        if (!CONFIG.TEST_MODE && CONFIG.PAUSE_EMPTY) {
          ag.pause();
          Logger.log('  -> Paused');
        }

        emptyGroups.push(info);
      }
    }

    Logger.log('Scanned ' + totalScanned + ' ad groups. Found ' +
               emptyGroups.length + ' empty (keywords but no ads).');

    if (emptyGroups.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@domain.com') {
      var lines = emptyGroups.map(function(g) {
        return g.campaign + ' > ' + g.adGroup + ' (' + g.keywords + ' keywords)';
      });
      var action = CONFIG.PAUSE_EMPTY ? 'paused' : 'flagged (not paused)';
      MailApp.sendEmail(CONFIG.EMAIL,
        'Empty Ad Groups: ' + emptyGroups.length + ' ad group(s) ' + action,
        'The following ad groups had active keywords but no active ads (' + action + '):\n\n' +
        lines.join('\n') +
        '\n\nTip: For large accounts (500+ ad groups), schedule this script weekly to avoid timeout.');
      Logger.log('Alert email sent to ' + CONFIG.EMAIL);
    }
  } catch (e) {
    Logger.log('FATAL ERROR: ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@domain.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Empty Ad Group Alerter — Script Error', e.message);
    }
  }
}
