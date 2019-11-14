/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';
import { addQueryArgs } from 'lib/route';
import getUnconnectedSiteUrl from 'state/selectors/get-unconnected-site-url';
import { isJetpackSite } from 'state/sites/selectors';

class ConnectIntro extends PureComponent {
	static propTypes = {
		action: PropTypes.string,
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
			action,
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
				connect_url_redirect: true,
				calypso_env: config( 'env_id' ),
				from: 'jpo',
				page: 'jetpack',
				// TODO: Pass current URL as prop, have consumer generate it from host and port
				// config values plus `[ basePath, stepName, siteSlug ].join( '/' )`.
				// (We need an absolute URL here.)
				redirect_after_auth: addQueryArgs( { action }, window.location.href ),
			},
			siteUrl + '/wp-admin/admin.php'
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
