# Borgia Fair Volunteer Portal v2.1 Portable

This version runs locally by double-clicking `index.html` and also works on GitHub Pages.

## Changes in v2.1
- Uses the real uploaded icon filenames:
  - SFB_Fair_IconsCoach.svg
  - SFB_Fair_IconsFishorSodaStand.svg
  - SFB_Fair_IconsFishStand.svg
  - SFB_Fair_IconsPointCoach.svg
  - SFB_Fair_IconsSodaStand.svg
  - SFB_Fair_IconsSubstitute.svg
- Uses the uploaded hero image at `assets/hero/borgia_fair_hero.png`
- Last names are included in displayed volunteer names.
- Confirmed/Awaiting boards stay hidden until Coordinator View is opened.
- Assignment cards show only Point Coach name to prevent overflow.
- Point Coach Directory includes name, email, and phone.
- Overall text sizing is slightly reduced.

## Important
This portable prototype stores confirmations and trade requests in the browser via localStorage.
For shared confirmations/trades/emails, connect it to Microsoft Lists + Power Automate later.


## v2.3 notes
- Header changed from Contacts to Lead Knights.
- Head Coaches list is text-only and does not repeat Point Coach headshots.
- Point Coaches remain available in the confirmation dropdown.
- Hero image uses contain/proportional scaling with a soft background.
- Added subtle last-resort Chris Arand footer contact with round headshot.


## v2.4 notes
- Request Trade now opens a structured unavailable-times modal.
- Days are based on the schedule data.
- Each day has a checkbox.
- Time blocks are radio buttons defaulted off and enabled only after selecting the day.
- Possible trade slots are previewed based on unavailable days/times.


## v2.5 notes
- Trade Request now defaults to "Times I CAN work."
- Added a switch for "Times I CAN work" vs "Times I CANNOT work."
- The same day/time picker is reused for either mode.
- Possible matches update based on the selected mode.


## v2.6 notes
- Possible Trade Slots no longer cuts off after 10 results.
- The modal grows as needed and shows all matching slots based on the selected available/cannot-work choices.


## v2.7 notes
- Added 2026 Borgia Volunteer Fair Announcement as `announcement.html`.
- Added subtle footer link to the announcement.
- Added Pass Splitter tab/section.
- Pass Splitter matches families by different days first, then same-day opposite time blocks.
- Pass Splitter is parent-to-parent coordination and uses mailto links.


## v2.8 notes
- Pass Splitter no longer requires remembering a slot number.
- Users can search by name, email, phone, or slot number.
- Selecting a result fills the hidden slot value and shows pass matches.


## v2.9 notes
- Request Trade button changed to Looking to Trade.
- Replaced confusing current-shift checkbox with Reason for Trade Request:
  - Schedule conflict
  - Preference only
- Matching view now separates profiles already Looking to Trade from other workable slots.
- Matching posted trade profiles include an Email Trade Offer button.


## v2.10 notes
- Trade modal buttons now appear immediately under the filter controls.
- Possible trade matches only show families who have already posted a Looking to Trade request.
- Other schedule slots are no longer exposed as trade match suggestions.
- Pass Splitter moved to the end and styled as a distinct section.
