/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const AmpJetpack = ( {
	siteSlug,
	translate
} ) => {
	return (
		<div>
			<SectionHeader label={ translate( 'Accelerated Mobile Pages (AMP)' ) } />

			<CompactCard>
				<p>
					{ translate(
						'AMP enables the creation of websites and ads that load near instantly, ' +
						'giving site visitors a smooth, more engaging experience on mobile and desktop.'
					) }
				</p>
			</CompactCard>

			<CompactCard href={ '/plugins/amp/' + siteSlug }>
				{ translate( 'Install the AMP plugin' ) }
			</CompactCard>
		</div>
	);
};

export default connect(
	( state ) => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} )
)( localize( AmpJetpack ) );
