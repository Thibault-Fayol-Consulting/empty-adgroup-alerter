/**
 * --------------------------------------------------------------------------
 * Empty Ad Group Alerter — Script Google Ads
 * --------------------------------------------------------------------------
 * Scanne tous les groupes d'annonces actifs pour detecter une erreur
 * frequente : des mots-cles actifs mais zero annonce active. Ces groupes
 * "zombies" gaspillent du budget. Peut les mettre en pause et envoyer
 * une alerte email.
 *
 * Auteur :  Thibault Fayol — Consultant SEA PME
 * Site :    https://thibaultfayol.com
 * Licence : MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true,                      // true = log uniquement, false = pause les groupes + envoie email
  EMAIL: 'contact@votredomaine.com',    // Destinataire des alertes
  PAUSE_EMPTY: true                     // true = met en pause les groupes vides quand TEST_MODE est false
};

function main() {
  try {
    Logger.log('Recherche de groupes d\'annonces avec mots-cles actifs mais sans annonces...');

    var agIter = AdsApp.adGroups()
      .withCondition('Status = ENABLED')
      .withCondition('CampaignStatus = ENABLED')
      .get();

    var groupesVides = [];
    var totalScannes = 0;

    while (agIter.hasNext()) {
      var ag = agIter.next();
      totalScannes++;

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

        Logger.log('Vide : ' + info.campaign + ' > ' + info.adGroup +
                    ' (' + info.keywords + ' mots-cles actifs, 0 annonces)');

        if (!CONFIG.TEST_MODE && CONFIG.PAUSE_EMPTY) {
          ag.pause();
          Logger.log('  -> Mis en pause');
        }

        groupesVides.push(info);
      }
    }

    Logger.log('Scanne ' + totalScannes + ' groupes. Trouve ' +
               groupesVides.length + ' vides (mots-cles sans annonces).');

    if (groupesVides.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      var lines = groupesVides.map(function(g) {
        return g.campaign + ' > ' + g.adGroup + ' (' + g.keywords + ' mots-cles)';
      });
      var action = CONFIG.PAUSE_EMPTY ? 'mis en pause' : 'signales (non pauses)';
      MailApp.sendEmail(CONFIG.EMAIL,
        'Groupes Vides : ' + groupesVides.length + ' groupe(s) ' + action,
        'Les groupes suivants avaient des mots-cles actifs mais aucune annonce (' + action + ') :\n\n' +
        lines.join('\n') +
        '\n\nAstuce : Pour les gros comptes (500+ groupes), planifiez ce script chaque semaine.');
      Logger.log('Email d\'alerte envoye a ' + CONFIG.EMAIL);
    }
  } catch (e) {
    Logger.log('ERREUR FATALE : ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Empty Ad Group Alerter — Erreur script', e.message);
    }
  }
}
