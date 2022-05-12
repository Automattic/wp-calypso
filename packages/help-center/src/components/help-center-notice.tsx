import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink, Icon } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { AnalysisReport } from '@automattic/data-stores';

type Props = {
	ownershipResult: AnalysisReport[ 'result' ];
	isAnalysisLoading: boolean;
	userDeclaredSite: AnalysisReport[ 'site' ];
};

const responses: Record< AnalysisReport[ 'result' ], React.ReactChild > = {
	NOT_OWNED_BY_USER: (
		<p>
			{ __(
				'Your site is linked to another WordPress.com account. If you’re trying to access it, please follow our Account Recovery procedure.',
				__i18n_text_domain__
			) }
			&nbsp;{ ' ' }
			<ExternalLink href={ localizeUrl( 'https://wordpress.com/wp-login.php?action=recovery' ) }>
				{ __( 'Learn More', __i18n_text_domain__ ) }
			</ExternalLink>
		</p>
	),
	WPCOM: '',
	WPORG: (
		<p>
			{ createInterpolateElement(
				__(
					'Your site is not <hosted_on_our_services>hosted with our services</hosted_on_our_services>. Support for the self-hosted version of WordPress is provided by the <wordpress_org_community_forums>WordPress.org community forums</wordpress_org_community_forums>, or if the problem relates to a specific plugin or theme, contact support for that product instead. If you’re not sure, share your question with a link, and we’ll point you in the right direction!',
					__i18n_text_domain__
				),
				{
					hosted_on_our_services: (
						<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/com-vs-org/' ) } />
					),
					wordpress_org_community_forums: (
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
};

export function HelpCenterOwnershipNotice( {
	ownershipResult,
	isAnalysisLoading,
	userDeclaredSite,
}: Props ) {
	if ( isAnalysisLoading || ownershipResult === 'WPCOM' ) {
		if ( ownershipResult === 'WPCOM' ) {
			return <p className="help-center-notice__positive-feedback">{ userDeclaredSite?.name }</p>;
		}
		return null;
	}
	return (
		<div className="help-center-notice__container">
			<div>
				<Icon icon="info-outline"></Icon>
			</div>
			{ responses[ ownershipResult ] }
		</div>
	);
}
