/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { addQueryArgs } from 'lib/route';
import { getUnconnectedSiteUrl } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';

class ConnectIntro extends PureComponent {
	static propTypes = {
		buttonLabel: PropTypes.string,
		description: PropTypes.string,
		e2eType: PropTypes.string,
		header: PropTypes.node,
		illustration: PropTypes.string,
		onClick: PropTypes.func,
		siteId: PropTypes.number.isRequired,

		// Connected props
		isConnected: PropTypes.bool,
		siteUrl: PropTypes.string,
	};

	render() {
		const {
			buttonLabel,
			description,
			e2eType,
			header,
			illustration,
			isConnected,
			onClick,
			siteUrl,
		} = this.props;
		const connectUrl = addQueryArgs(
			{
				url: siteUrl,
				// TODO: add a parameter to the JPC to redirect back to this step after completion
				// and in the redirect URL include the ?action=SOMEACTION parameter
				// to actually trigger the action after getting back to JPO
			},
			'/jetpack/connect'
		);
		const href = ! isConnected ? connectUrl : null;

		return (
			<Fragment>
				{ header }

				<TileGrid>
					<Tile
						buttonLabel={ buttonLabel }
						description={ description }
						e2eType={ e2eType }
						image={ illustration }
						onClick={ onClick }
						href={ href }
					/>
				</TileGrid>
			</Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isConnected: isJetpackSite( state, siteId ),
	siteUrl: getUnconnectedSiteUrl( state, siteId ),
} ) )( ConnectIntro );
