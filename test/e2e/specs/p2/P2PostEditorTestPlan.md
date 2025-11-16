# P2 Post Editor – Comprehensive Test Plan

## 1. Executive Summary
This test plan covers end‑to‑end functional validation of creating and publishing a new post on a WordPress.com P2 site using the P2 post editor. It is designed for repeatable execution against a clean test environment (seed state) as represented by the Playwright seed spec (`seed.spec.ts`). It includes happy paths, variants, negative/validation cases, accessibility, performance smoke checks, and integration points (notifications, activity, permalink behavior).

## 2. Scope
**In Scope:**
- Launching the editor from the P2 homepage ("New Post" action)
- Basic post creation (title, body, blocks, mentions, links, formatting)
- Media insertion (images, video placeholder, file uploads)
- Embeds (e.g., URL pastes -> auto embed behavior)
- Taxonomy / organizational metadata (if surfaced: tags, categories – optional in P2)
- Post settings (visibility, publish now, schedule, update)
- Draft autosave / manual save (if available)
- Publishing flow & confirmation UI
- Post rendered view (content fidelity, block rendering, meta)
- Activity/notifications (inline comment icon counts, @mention notification trigger)
- Editing an existing post after publish (update state)
- Edge cases (empty title, huge content, special characters, emoji, RTL text, code blocks)

**Out of Scope (for this cycle):**
- Deep Gutenberg block library exhaustive testing
- Mobile native app clients
- Browser compatibility matrix beyond primary (Chrome latest) smoke
- Localization extensive coverage (perform spot check only)

## 3. Assumptions
- Tester has a valid authenticated test account with permission to post.
- Site is a properly configured P2 instance with default settings.
- Network stable; no throttling unless performing performance/edge scenario.
- No conflicting plugins altering the editor behavior.
- Seed spec authenticates and navigates to site root before invoking editor.

## 4. Test Data Strategy
- Use uniquely timestamped titles: `P2 Test Post – <ISO Timestamp>`
- Media: small PNG (logo), large JPEG (>3MB), SVG (if allowed), MP4 short clip.
- Edge text samples: emoji set, long paragraph (5K+ chars), code snippet, mixed RTL.
- Mentions: at least one other valid user on the P2 site (`@collaborator`).
- Links: internal post link, external HTTPS link.

## 5. Environments & Tools
- Browser: Chrome (Playwright default) + one secondary (Firefox) smoke.
- Automation: Playwright spec extension from `seed.spec.ts`.
- Monitoring: Console log capture for errors; network request logging (optional).

## 6. Risks & Mitigations
- Flaky autosave timing → Add waits/assertions on draft indicator.
- Media upload variability → Use deterministic small test files.
- Mentions require existing user → Pre-provision collaborator account.
- Scheduling timezone offsets → Normalize environment TZ (UTC) for assertions.

## 7. Test Scenario Matrix Overview
| ID | Category | Scenario Title |
|----|----------|----------------|
| S1 | Launch   | Open new post editor from homepage |
| S2 | Basic    | Create & publish minimal text post |
| S3 | Validation | Prevent publish with empty content |
| S4 | Formatting | Apply rich text (bold/italic/heading/list) |
| S5 | Mentions | Insert @mention and verify notification trigger |
| S6 | Media | Insert single image, verify render post-publish |
| S7 | Media | Upload large image (size boundary) |
| S8 | Embeds | Paste YouTube URL and verify embed block |
| S9 | Links | Insert internal and external links |
| S10 | Autosave | Draft autosave triggers & recovery after refresh |
| S11 | Scheduling | Schedule a future post and verify not immediately visible |
| S12 | Visibility | Change visibility (Public -> Private) and assert access control |
| S13 | Update | Edit published post and confirm updated content version |
| S14 | Long Content | Publish very long body (performance smoke) |
| S15 | Special Chars | Emoji + RTL + code block rendering |
| S16 | Tags/Categories | Add tags (if available) and verify metadata display |
| S17 | Notifications | Verify follower receives publish notification (if system enabled) |
| S18 | Comments Indicator | Post shows comment icon & count after a test comment |
| S19 | Accessibility | Keyboard navigation & focus order basic checks |
| S20 | Error Handling | Simulated network failure during publish (retry path) |

## 8. Detailed Scenarios

### S1: Launch New Post Editor
**Preconditions:** Authenticated on P2 homepage.  
**Steps:**
1. Click the "New Post" (or equivalent) button.
2. Wait for editor canvas to load (selector for title/body area visible).
3. Assert presence of primary controls (Publish button, settings panel trigger, block inserter).
**Expected:** Editor loads without console errors; focus in title field.

### S2: Create & Publish Minimal Text Post (Happy Path)
**Steps:**
1. Enter title: `P2 Test Post – <timestamp>`.
2. Enter body: `This is a minimal body.`
3. Click Publish.
4. Confirm any publish confirmation modal/dialog.
5. Wait for redirect or published confirmation toast.
6. Open permalink if not auto navigated.
**Expected:** Post visible with correct title/body; author attribution correct; timestamp current.

### S3: Prevent Publish With Empty Content
**Steps:**
1. Open editor.
2. Leave title and body empty.
3. Attempt Publish.
**Expected:** Publish disabled or validation error; no network publish request.
**Failure Conditions:** 200 publish request created with empty content.

### S4: Rich Text Formatting
**Steps:**
1. In body create: Heading, bold phrase, italic word, bulleted list (3 items), numbered list (2 items).
2. Publish.
3. View post.
**Expected:** Semantic HTML tags (<h2>, <strong>, <em>, <ul>/<ol>) rendered; styles applied.

### S5: @Mention Notification
**Steps:**
1. Type `@collaborator` in body.
2. Ensure mention autocomplete appears; select user.
3. Publish.
4. Log in (or switch) to collaborator account; check notifications panel.
**Expected:** Notification referencing newly published post.

### S6: Insert Single Image
**Steps:**
1. Use block inserter to add Image block.
2. Upload `small.png`.
3. Add alt text.
4. Publish.
**Expected:** Image displays in post; alt text present in DOM; correct intrinsic size.

### S7: Large Image Boundary
**Steps:**
1. Insert large JPEG (>3MB).
2. Confirm progress indicator then success.
3. Publish.
**Expected:** Upload completes; no timeout; responsive display.
**Edge:** If size exceeds limit, graceful error.

### S8: YouTube Embed
**Steps:**
1. Paste valid YouTube URL into empty paragraph block.
2. Wait for auto-transform to embed.
3. Publish.
**Expected:** Embedded player iframe visible; no console CSP errors.

### S9: Internal & External Links
**Steps:**
1. Create text linking to previously published post (internal).
2. Create external link (e.g., https://wordpress.com/).
3. Publish.
4. Hover links.
**Expected:** Internal opens within same tab; external has target consistent with site policy; markup contains rel attributes if required.

### S10: Draft Autosave & Recovery
**Steps:**
1. Enter title & partial body.
2. Wait for autosave indicator (or poll network requests).
3. Close tab without publishing.
4. Reopen "New Post" (draft restoration flow).
**Expected:** Previous draft restored; content matches last autosaved snapshot.

### S11: Schedule Future Post
**Steps:**
1. Open post settings panel.
2. Set publish date/time +10 minutes future.
3. Click Schedule.
4. Return to homepage; verify post not listed.
5. After scheduled time, refresh.
**Expected:** Post appears at scheduled time; timestamp reflects scheduled value.

### S12: Visibility Control
**Steps:**
1. Set visibility to Private (or site‑restricted).
2. Publish.
3. Open permalink in incognito window.
**Expected:** Access restricted / not found message; original session sees content.

### S13: Edit Published Post
**Steps:**
1. Publish initial post.
2. Click Edit.
3. Append text to body.
4. Update.
5. View post.
**Expected:** Updated content present; revision timestamp updated; no duplicate post.

### S14: Long Body Performance
**Steps:**
1. Paste large lorem (≥5000 chars) plus multiple blocks.
2. Scroll through editor for lag check.
3. Publish.
**Expected:** Publish completes < acceptable threshold (e.g., 5s); page renders fully; no truncated content.

### S15: Special Characters & RTL
**Steps:**
1. Insert mixed content: emojis 😀🚀, RTL phrase (Arabic), code block with `<script>`.
2. Publish.
**Expected:** Emojis render; RTL maintains correct direction; code block escaped properly.

### S16: Tags (If Available)
**Steps:**
1. Add 2–3 tags (e.g., `testing`, `p2-flow`).
2. Publish.
3. Inspect rendered post metadata.
**Expected:** Tags listed; tag links navigate to tag archive.

### S17: Publish Notification to Followers
**Steps:**
1. Ensure test follower subscribed to site.
2. Publish new post.
3. Check follower notification channel (email or in-app). 
**Expected:** Notification received with correct title/permalink.

### S18: Comments Indicator
**Steps:**
1. Publish post.
2. Add a comment from another account.
3. Return to post listing.
**Expected:** Comment count increments; indicator visible.

### S19: Accessibility – Keyboard Navigation
**Steps:**
1. Use Tab/Shift+Tab to traverse controls from title to publish.
2. Activate publish via keyboard (Enter/Space).
**Expected:** Focus outline visible; order logical; publish triggers same as click.

### S20: Network Failure During Publish
**Steps:**
1. Simulate offline or intercept publish request to fail.
2. Attempt Publish.
3. Restore network; retry.
**Expected:** User-friendly error; retry succeeds; no duplicate posts.

## 9. Non-Functional Spot Checks
- Console Errors: Zero severe errors during edit & load.
- Network Requests: Publish triggers expected REST/GraphQL endpoints once.
- Performance: Editor initial load < 3s on baseline machine.

## 10. Reporting & Logging
- Capture screenshot on failure.
- Store console logs & network HAR for S20, S14.
- Record timestamps for scheduling validation.

## 11. Exit Criteria
- All S1–S13 pass without blocking defects.
- No critical accessibility failures in S19.
- Error handling proven (S3, S20).

## 12. Playwright Implementation Notes
- Extend `seed.spec.ts` to modular helper functions (e.g., `createPost({ title, body })`).
- Use data-test selectors where available; fallback to role/aria queries.
- Add retry logic for flaky autosave waits.

## 13. Future Enhancements
- Add cross-browser matrix.
- Integrate lighthouse performance audit in CI.
- Expand block library coverage.

---
Prepared for: P2 Post Editor QA Cycle
