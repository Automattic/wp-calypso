/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import SearchCard from 'components/search-card';
import Button from 'components/button';

export class TaxonomyManager extends Component {
	static propTypes = {
		translate: PropTypes.func,
		taxonomy: PropTypes.string,
	};

	render() {
		return (
			<div>
				<SectionHeader label={ this.props.translate( 'Categories' ) }>
					<Button compact primary>
						{ this.props.translate( 'Add Category' ) }
					</Button>
				</SectionHeader>
				<Card>
					<SearchCard onSearch={ () => {} } />
				</Card>
			</div>
		);
	}
}

export default localize( TaxonomyManager );
