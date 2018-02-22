/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import Tile from 'components/tile-grid/tile';
import TileGrid from 'components/tile-grid';

class ConnectSuccess extends PureComponent {
	static propTypes = {
		href: PropTypes.string,
		illustration: PropTypes.string,
		onClick: PropTypes.func,
		title: PropTypes.string,
		// from HOCs
		translate: PropTypes.func,
	};

	render() {
		const { href, illustration, onClick, title, translate } = this.props;

		return (
			<Fragment>
				<FormattedHeader headerText={ title } />

				<TileGrid>
					<Tile
						buttonLabel={ translate( 'Continue' ) }
						image={ illustration }
						onClick={ onClick }
						href={ href }
					/>
				</TileGrid>
			</Fragment>
		);
	}
}

export default localize( ConnectSuccess );
