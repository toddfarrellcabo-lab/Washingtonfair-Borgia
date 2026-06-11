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


## v2.11 notes
- Mobile search result cards are more compact.
- Assignment icon is smaller.
- Details stack tightly.
- Buttons use a 2-column grid.
- Point Coach detail is shortened on mobile.
- Hero hides on very short mobile viewport/keyboard situations to reduce bouncing and improve visibility.


## v2.12 notes
- Mobile assignment results now collapse into short tappable rows.
- Tapping an assignment card opens full details.
- Lead Knights/Contacts section starts collapsed by default.
- Changed files: `js/app.js` and `css/style.css`.


## v2.13 notes
- Reviewed current site structure and tightened the mobile workflow.
- Search results now collapse into short rows at widths up to 900px, which helps inside mobile browsers and Teams/webviews.
- Tapping an assignment opens full details.
- Sport Coach is now optional during confirmation.
- Confirmation email still sends to parents and Point Coach; selected Sport Coach is only CC'd if chosen.
- Confirmation email includes Sport Coach email when a coach is selected.
- Contacts/Lead Knights section remains collapsed by default.
- Changed files: `js/app.js`, `css/style.css`, and `README.md`.


## v2.16 notes
- Removed the old combined Lead Knights/Coach Directory section.
- Added a visible Point Coaches section on the homepage.
- Added a separate Head Coaches section that collapses by default.
- Navigation now points to Point Coaches instead of Coach Directory.
- Sport Coach is optional when confirming an assignment.
- Changed files: index.html, js/app.js, css/style.css, README.md.


## v2.18 notes
- Repaired wrong CSS being included in the site package.
- Restored Borgia blue/gold Point Coach cards.
- Kept hero image visible on mobile.
- Point Coaches are visible.
- Coaches section is collapsed by default with simple Show/Hide button.
- Sport Coach remains optional.
- Rebuilt index structure so Find, Point Coaches, Coaches, Trade Board, and Pass Splitter are all inside the main container.


## v2.19 notes
- Rebuilt CSS with a lighter Borgia-inspired style based on the provided school stylesheet.
- Removed duplicate Pass Splitter and Trade Board sections.
- Reduced heavy/blocky typography and softened buttons/cards.
- Kept Point Coaches visible and Coaches collapsed by default.
- Moved Pass Splitter before Trade Board so Trade is lower priority.


## v2.20 notes
- Visual cleanup pass inspired by borgia.com typography and spacing.
- Kept Point Coach headshots and Chris Arand footer headshot.
- Dialed back heavy dark-blue blocks, font weights, and oversized labels.
- Cleaned Trade Request modal copy and styling.
- Removed duplicate Pass Splitter / Trade Board sections.
- Kept Pass Splitter before Trade Board.


## v3.0 notes
- Visual rebuild inspired by Apple Support: clearer hierarchy, softer sections, less dark blue.
- Added "How can we help?" quick-action intro.
- Reduced top nav to Assignments, Pass Splitter, Trade Board, Contacts, Coordinator.
- Kept Point Coach photos and Chris Arand footer photo.
- Made Point Coach cards smaller, lighter, and less visually dominant.
- Made Pass Splitter feel like a separate ticket-sharing tool.
- Made Trade Board secondary and quieter.
- Merged need-help messaging into the footer/contact area.
- Removed duplicate Pass Splitter / Trade Board sections.
- Cleaned trade modal wording and styling.


## v3.1 notes
- Removed the redundant "How can we help?" intro and quick-action buttons.
- Made Find Assignment the immediate primary section.
- Reduced hero size.
- Strengthened top navigation buttons.
- Reworked Point Coach cards with color, square headshots, prominent abbreviated date, and no email wrapping.
- Combined Head Coaches heading and Show control into one compact accordion row.
- Made Pass Splitter feel like a separate ticket-style feature.
- Renamed Trade Board visually to Slot Swap and made it feel like its own feature panel.
- Integrated Need Help into a cleaner footer area.
