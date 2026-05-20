import { WPCOM_FEATURES_BACKUPS } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const JetpackChecklistHeader = ( { hasBackups, translate } ) => (
	<Fragment>
		<Card compact className="jetpack-checklist__top">
			<strong>{ translate( 'My Checklist' ) }</strong>
		</Card>
		<Card compact className="jetpack-checklist__header">
			<img
				className="jetpack-checklist__header-illustration"
				alt=""
				aria-hidden="true"
				src="/calypso/images/illustrations/security.svg"
			/>
			<div className="jetpack-checklist__header-content">
				<CardHeading>
					{ translate(
						"Let's start by securing your site with a few essential security features"
					) }
				</CardHeading>
				{ hasBackups && (
					<p>
						{ translate(
							'These security features ensure that your site is secured and backed up.'
						) }
					</p>
				) }
			</div>
		</Card>
	</Fragment>
);

export default connect( ( state ) => ( {
	hasBackups: siteHasFeature( state, getSelectedSiteId( state ), WPCOM_FEATURES_BACKUPS ),
} ) )( localize( JetpackChecklistHeader ) );
