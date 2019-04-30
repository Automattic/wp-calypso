/**
 * External dependencies
 */
import React from 'react';
import { memoize } from 'lodash';

const loadStep = memoize( stepName =>
	React.lazy( () =>
		import(
			/* webpackChunkName: "async-load-signup-steps-[request]", webpackInclude: /signup\/steps\/[a-z-]+\/index.jsx$/ */ `signup/steps/${ stepName }`
		)
	)
);

export default {
	about: loadStep( 'about' ),
	'clone-start': loadStep( 'clone-start' ),
	'clone-destination': loadStep( 'clone-destination' ),
	'clone-credentials': loadStep( 'clone-credentials' ),
	'clone-point': loadStep( 'clone-point' ),
	'clone-jetpack': loadStep( 'clone-jetpack' ),
	'clone-ready': loadStep( 'clone-ready' ),
	'clone-cloning': loadStep( 'clone-cloning' ),
	'creds-confirm': loadStep( 'creds-confirm' ),
	'creds-complete': loadStep( 'creds-complete' ),
	'creds-permission': loadStep( 'creds-permission' ),
	domains: loadStep( 'domains' ),
	'domains-store': loadStep( 'domains' ),
	'domain-only': loadStep( 'domains' ),
	'domains-theme-preselected': loadStep( 'domains' ),
	'domains-launch': loadStep( 'domains' ),
	'from-url': loadStep( 'import-url' ),
	launch: loadStep( 'launch-site' ),
	plans: loadStep( 'plans' ),
	'plans-launch': loadStep( 'plans' ),
	'plans-personal': loadStep( 'plans' ),
	'plans-premium': loadStep( 'plans' ),
	'plans-business': loadStep( 'plans' ),
	'plans-store-nux': loadStep( 'plans-atomic-store' ),
	'plans-site-selected': loadStep( 'plans-without-free' ),
	site: loadStep( 'site' ),
	'rebrand-cities-welcome': loadStep( 'rebrand-cities-welcome' ),
	'rewind-migrate': loadStep( 'rewind-migrate' ),
	'rewind-were-backing': loadStep( 'rewind-were-backing' ),
	'rewind-add-creds': loadStep( 'rewind-add-creds' ),
	'rewind-form-creds': loadStep( 'rewind-form-creds' ),
	'site-or-domain': loadStep( 'site-or-domain' ),
	'site-picker': loadStep( 'site-picker' ),
	'site-style': loadStep( 'site-style' ),
	'site-title': loadStep( 'site-title' ),
	'site-title-without-domains': loadStep( 'site-title' ),
	'site-topic': loadStep( 'site-topic' ),
	'site-type': loadStep( 'site-type' ),
	survey: loadStep( 'survey' ),
	'survey-user': loadStep( 'survey-user' ),
	test: loadStep( 'test-step' ),
	themes: loadStep( 'theme-selection' ),
	'website-themes': loadStep( 'theme-selection' ),
	'blog-themes': loadStep( 'theme-selection' ),
	'themes-site-selected': loadStep( 'theme-selection' ),
	user: loadStep( 'user' ),
	'oauth2-user': loadStep( 'user' ),
	'oauth2-name': loadStep( 'user' ),
	displayname: loadStep( 'user' ),
	'reader-landing': loadStep( 'reader-landing' ),
	// Steps with preview
	'site-style-with-preview': loadStep( 'site-style' ),
	'site-topic-with-preview': loadStep( 'site-topic' ),
	'domains-with-preview': loadStep( 'domains' ),
	'site-title-with-preview': loadStep( 'site-title' ),
};
