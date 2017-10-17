/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import FoldableCard from 'components/foldable-card';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import { openChat as openChatAction } from 'state/happychat/ui/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const Troubleshoot = ( { openChat, siteSlug, translate } ) => (
	<div className="disconnect-site__troubleshooting">
		<SectionHeader label={ translate( 'Having problems with your connection?' ) } />
		<CompactCard href={ 'https://jetpack.com/support/debug/?url=' + siteSlug } target="_blank">
			{ translate( 'Diagnose a connection problem' ) }
		</CompactCard>
		<FoldableCard header={ translate( 'Get help from our Happiness Engineers' ) }>
			<FormTextInput />
			<Button primary compact onClick={ openChat }>
				{ translate( 'Start Chat' ) }
			</Button>
		</FoldableCard>
	</div>
);

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ openChat: openChatAction }
)( localize( Troubleshoot ) );
