/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';

class CacheStats extends Component {
	static propTypes = {
		files: PropTypes.array,
		header: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		files: [],
	};

	getAge = ( { lower_age, upper_age } ) => {
		if ( lower_age && upper_age ) {
			return `${ lower_age } - ${ upper_age }`;
		} else if ( lower_age ) {
			return lower_age;
		} else if ( upper_age ) {
			return upper_age;
		}

		return '';
	}

	render() {
		const {
			files,
			header,
			translate,
		} = this.props;

		return (
			<FoldableCard
				compact
				className="wp-super-cache__foldable-card"
				header={ header || '' }>
				<table className="wp-super-cache__stats">
					<thead>
						<tr className="wp-super-cache__stats-header-row">
							<th className="wp-super-cache__stats-header-column">{ translate( 'URI' ) }</th>
							<th className="wp-super-cache__stats-header-column">{ translate( 'Files' ) }</th>
							<th className="wp-super-cache__stats-header-column">{ translate( 'Age' ) }</th>
							<th className="wp-super-cache__stats-header-column"></th>
						</tr>
					</thead>
					<tbody>
						{ files.map( ( file, index ) =>
						<tr className="wp-super-cache__stat" key={ index }>
							<td className="wp-super-cache__stat-dir">{ file.dir }</td>
							<td>{ file.files }</td>
							<td className="wp-super-cache__stat-age">{ this.getAge( file ) }</td>
							<td className="wp-super-cache__stat-action">
								<Button compact>
									{ translate( 'Delete' ) }
								</Button>
							</td>
						</tr>
					) }
					</tbody>
				</table>
			</FoldableCard>
		);
	}
}

export default localize( CacheStats );
