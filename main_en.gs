/**
 * --------------------------------------------------------------------------
 * empty-adgroup-alerter - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, EMAIL: "contact@domain.com" };
function main() {
    Logger.log("Scanning out-of-sync Ad Groups (Active Keywords but No Active Ads)...");
    var agIter = AdsApp.adGroups().withCondition("Status = ENABLED").withCondition("CampaignStatus = ENABLED").get();
    var emptyGroups = [];
    
    while(agIter.hasNext()) {
        var ag = agIter.next();
        var numKeywords = ag.keywords().withCondition("Status = ENABLED").get().totalNumEntities();
        var numAds = ag.ads().withCondition("Status = ENABLED").get().totalNumEntities();
        
        if (numKeywords > 0 && numAds === 0) {
            var msg = "Campaign: " + ag.getCampaign().getName() + " > AdGroup: " + ag.getName();
            Logger.log("Empty AdGroup Found: " + msg);
            emptyGroups.push(msg);
            if (!CONFIG.TEST_MODE) ag.pause();
        }
    }
    
    if (emptyGroups.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== "contact@domain.com") {
        MailApp.sendEmail(CONFIG.EMAIL, "Google Ads Alert: Empty Ad Groups Paused", "The following Ad Groups had active keywords but no active ads:\n\n" + emptyGroups.join("\n"));
    }
    Logger.log("Scan complete. Found " + emptyGroups.length + " issues.");
}
