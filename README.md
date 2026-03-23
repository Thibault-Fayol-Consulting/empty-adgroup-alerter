# Empty Ad Group Alerter

> Google Ads Script for SMBs — Detect ad groups with active keywords but no active ads

## What it does
Scans all enabled ad groups for a common misconfiguration: active keywords but zero active ads. These "zombie" ad groups waste budget since keywords trigger auctions but no ad can ever be shown. Optionally pauses them and sends an email alert.

## Setup
1. Open Google Ads > Tools > Scripts
2. Create a new script and paste the code from `main_en.gs` (or `main_fr.gs` for French)
3. Update the `CONFIG` block at the top:
   - `EMAIL`: your alert email
   - `TEST_MODE`: set to `false` when ready to pause empty ad groups
   - `PAUSE_EMPTY`: set to `false` if you only want alerts without pausing
4. Authorize and run a preview first
5. Schedule: **Weekly**

## CONFIG reference
| Parameter | Default | Description |
|-----------|---------|-------------|
| `TEST_MODE` | `true` | `true` = log only, `false` = pause ad groups + send email |
| `EMAIL` | `contact@domain.com` | Email address for empty ad group alerts |
| `PAUSE_EMPTY` | `true` | `true` = pause empty ad groups, `false` = alert only |

## How it works
1. Iterates all enabled ad groups in enabled campaigns
2. Counts active keywords and active ads in each ad group
3. Flags ad groups with keywords > 0 and ads = 0
4. Optionally pauses flagged ad groups
5. Sends a summary email listing all issues

## Batch processing note
For accounts with 500+ ad groups, the script may approach the 30-minute execution limit. In that case, schedule it weekly rather than daily to reduce load.

## Requirements
- Google Ads account (not MCC)
- Google Ads Scripts access

## License
MIT — Thibault Fayol Consulting
