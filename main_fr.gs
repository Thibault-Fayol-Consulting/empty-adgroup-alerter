/**
 * --------------------------------------------------------------------------
 * empty-adgroup-alerter - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, EMAIL: "contact@votredomaine.com" };
function main() {
    Logger.log("Recherche de groupes d'annonces désynchronisés (Mots-clés actifs mais aucune annonce active)...");
    var agIter = AdsApp.adGroups().withCondition("Status = ENABLED").withCondition("CampaignStatus = ENABLED").get();
    var emptyGroups = [];
    
    while(agIter.hasNext()) {
        var ag = agIter.next();
        var numKeywords = ag.keywords().withCondition("Status = ENABLED").get().totalNumEntities();
        var numAds = ag.ads().withCondition("Status = ENABLED").get().totalNumEntities();
        
        if (numKeywords > 0 && numAds === 0) {
            var msg = "Campagne : " + ag.getCampaign().getName() + " > AdGroup : " + ag.getName();
            Logger.log("Groupe vide détecté : " + msg);
            emptyGroups.push(msg);
            if (!CONFIG.TEST_MODE) ag.pause();
        }
    }
    
    if (emptyGroups.length > 0 && !CONFIG.TEST_MODE && CONFIG.EMAIL !== "contact@votredomaine.com") {
        MailApp.sendEmail(CONFIG.EMAIL, "Alerte Google Ads : Groupes d'annonces vides", "Les groupes suivants avaient des mots-clés mais aucune annonce :\n\n" + emptyGroups.join("\n"));
    }
    Logger.log("Scan terminé. " + emptyGroups.length + " problèmes trouvés.");
}
