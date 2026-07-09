//
// Pure helpers for classifying a desktop release version, kept separate from
// publish-desktop-release.js so they can be unit-tested without its side effects.
//

// Stable-channel auto-update resolves via GitHub's /releases/latest, which excludes
// prereleases. A beta (e.g. 8.2.3-beta.1) must be flagged prerelease or stable users
// get offered it. True when the version carries a SemVer prerelease component,
// with or without a leading `v`.
function isPrereleaseVersion( version ) {
	return /^v?\d+\.\d+\.\d+-/.test( version );
}

module.exports = { isPrereleaseVersion };
