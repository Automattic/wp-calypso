/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import EmptyContent from 'components/empty-content';
import i18n from 'lib/mixins/i18n';

const FeedError = ( { sidebarTitle } ) => (
	<Main>
		<MobileBackToSidebar>
			<h1>{ sidebarTitle }</h1>
		</MobileBackToSidebar>

		<EmptyContent
			title={ i18n.translate( 'Sorry. We can\'t find that stream.' ) }
			illustration={ '/calypso/images/drake/drake-404.svg' }
			illustrationWidth={ 500 }
		/>

	</Main>
);

FeedError.propTypes = {
	sidebarTitle: React.PropTypes.string
};

export default FeedError;
