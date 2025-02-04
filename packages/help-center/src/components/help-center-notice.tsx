import { localizeUrl, useLocale, getRelativeTimeString } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import type { AnalysisReport, SupportActivity } from '../types';
import type { ReactNode } from 'react';

import './help-center-notice.scss';

type Props = {
	ownershipResult: AnalysisReport | null;
};

function getResponses( siteName?: string ) {
	const responses: Record< AnalysisReport[ 'result' ], React.ReactElement | string > = {
		NOT_OWNED_BY_USER: (
			<p>
				{ sprintf(
					/* translators: %s is site name (eg myblog.com) */
					__(
						'%s is linked to another WordPress.com account. If you’re trying to access it, please follow our Account Recovery procedure.',
						__i18n_text_domain__
					),
					siteName
				) }
				&nbsp;{ ' ' }
				<ExternalLink href={ localizeUrl( 'https://wordpress.com/wp-login.php?action=recovery' ) }>
					{ __( 'Learn More', __i18n_text_domain__ ) }
				</ExternalLink>
			</p>
		),
		WPORG: (
			<p>
				{ createInterpolateElement(
					__(
						'Your site is not <hosted_on_our_services>hosted with our services</hosted_on_our_services>. Support for the self-hosted version of WordPress is provided by the <wordpress_org_community_forums>WordPress.org community forums</wordpress_org_community_forums>, or if the problem relates to a specific plugin or theme, contact support for that product instead. If you’re not sure, share your question with a link, and we’ll point you in the right direction!',
						__i18n_text_domain__
					),
					{
						hosted_on_our_services: (
							// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
							<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/com-vs-org/' ) } />
						),
						wordpress_org_community_forums: (
							// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
							<ExternalLink href={ localizeUrl( 'https://wordpress.org/support/forums/' ) } />
						),
					}
				) }
			</p>
		),
		UNKNOWN: (
			<p>
				{ __(
					"We couldn't fetch enough information about this site to determine our ability to support you with it.",
					__i18n_text_domain__
				) }
			</p>
		),
		OWNED_BY_USER: '',
		DISABLED: '',
		LOADING: '',
	};
	return responses;
}

function tryGetHost( url: string | undefined ) {
	if ( ! url ) {
		return null;
	}
	try {
		return new URL( url ).host;
	} catch {
		return url;
	}
}

export function HelpCenterOwnershipNotice( { ownershipResult }: Props ) {
	if ( ! ownershipResult ) {
		return null;
	}
	if ( ownershipResult.result === 'OWNED_BY_USER' ) {
		return (
			<p className="help-center-notice__positive-feedback">
				{ ownershipResult.site?.name || ownershipResult.siteURL }
			</p>
		);
	}
	const responses = getResponses(
		tryGetHost( ownershipResult.site?.URL ) || ownershipResult.siteURL
	);

	if ( responses[ ownershipResult.result ] ) {
		return <HelpCenterNotice>{ responses[ ownershipResult.result ] }</HelpCenterNotice>;
	}
	return null;
}

export function HelpCenterActiveTicketNotice( {
	tickets,
}: {
	tickets: SupportActivity[] | undefined;
} ) {
	const locale = useLocale();

	if ( ! tickets || ! tickets.length ) {
		return null;
	}

	return (
		<HelpCenterNotice>
			<p>
				<strong>
					{ sprintf(
						/* translators: %s humanized date ex: 2 hours ago */
						__( 'You submitted a request %s.', __i18n_text_domain__ ),
						getRelativeTimeString( {
							timestamp: tickets[ 0 ].timestamp * 1000,
							locale,
							style: 'long',
						} )
					) }
				</strong>{ ' ' }
				{ __(
					`Rest assured that we got your message and we'll be in touch as soon as we can.`,
					__i18n_text_domain__
				) }
			</p>
		</HelpCenterNotice>
	);
}

export function HelpCenterNotice( { children }: { children: ReactNode } ) {
	return (
		<div className="help-center-notice__container">
			<div>
				<Icon icon={ info } className="info-icon"></Icon>
			</div>
			{ children }
		</div>
	);
}
