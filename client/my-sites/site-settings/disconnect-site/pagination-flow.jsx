/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'gridicons';
import Main from 'components/main';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class PaginationFlow extends Component {
	handleClick = () => {
		const { siteSlug } = this.props;

		if ( ! siteSlug ) {
			return null;
		}
		//placeholder for redirection to the last screen of the flow
		//when the Survey is skipped
		page( '/settings/general/' + siteSlug );
	};

	render() {
		const { translate } = this.props;
		return (
			<Main className="disconnect-site__pagination main">
				<Button compact borderless onClick={ this.handleClick }>
					<Gridicon icon="arrow-right" size={ 18 } />
					{ translate( 'Skip Survey' ) }
				</Button>
			</Main>
		);
	}
}

export default connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( PaginationFlow ) );
