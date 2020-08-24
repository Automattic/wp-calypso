/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, get, map } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FoldableCard from 'components/foldable-card';
import { deleteFile } from '../../state/stats/actions';
import { isDeletingFile } from '../../state/stats/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

function getAge( lower, upper ) {
	if ( lower && upper ) {
		return `${ lower } - ${ upper }`;
	} else if ( lower ) {
		return lower;
	} else if ( upper ) {
		return upper;
	}

	return '';
}

class CacheStats extends Component {
	static propTypes = {
		deleteFile: PropTypes.func.isRequired,
		files: PropTypes.object,
		header: PropTypes.string,
		isDeleting: PropTypes.bool,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		files: [],
		header: '',
	};

	state = {
		url: '',
	};

	deleteFile = ( event ) => {
		const url = get( event, 'currentTarget.dataset.url', '' );

		if ( ! url ) {
			return;
		}

		const { isCached, isSupercache, siteId } = this.props;

		this.setState( { url } );
		this.props.deleteFile( siteId, url, isSupercache, isCached );
	};

	render() {
		const { files, header, isDeleting, translate } = this.props;

		return (
			<FoldableCard compact className="wp-super-cache__foldable-card" header={ header }>
				<table className="wp-super-cache__stats">
					<thead>
						<tr className="wp-super-cache__stats-header-row">
							<th className="wp-super-cache__stats-header-column">{ translate( 'URI' ) }</th>
							<th className="wp-super-cache__stats-header-column">{ translate( 'Files' ) }</th>
							<th className="wp-super-cache__stats-header-column">{ translate( 'Age' ) }</th>
							<th className="wp-super-cache__stats-header-column" />
						</tr>
					</thead>
					<tbody>
						{ map( files, ( { files: count, lower_age, upper_age }, url ) => (
							<tr className="wp-super-cache__stat" key={ url }>
								<td className="wp-super-cache__stat-dir">{ url }</td>
								<td>{ count }</td>
								<td className="wp-super-cache__stat-age">{ getAge( lower_age, upper_age ) }</td>
								<td className="wp-super-cache__stat-action">
									<Button
										compact
										busy={ isDeleting && this.state.url === url }
										data-url={ url }
										disabled={ isDeleting }
										onClick={ this.deleteFile }
									>
										{ translate( 'Delete' ) }
									</Button>
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</FoldableCard>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			isDeleting: isDeletingFile( state, siteId ),
			siteId,
		};
	},
	{ deleteFile }
);

export default flowRight( connectComponent, localize )( CacheStats );
