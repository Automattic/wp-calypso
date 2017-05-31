/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import withWidth from 'lib/with-width';
import SearchStreamHeader from '../../search-stream-header';
import { POSTS, SITES } from '../../search-stream-header';

class SearchStreamHeaderExample extends PureComponent {
	static displayName = 'SearchStreamHeaderExample';
	static propTypes = {
		width: React.PropTypes.number.isRequired,
	}

	state = {
		selected: POSTS,
	};

	render() {
		return (
			<Card>
				<SearchStreamHeader
					selected={ this.state.selected }
					onSelection={ selected => this.setState( { selected } ) }
					width={ this.props.width }
				/>
			</Card>
		);
	}
}

export default withWidth( SearchStreamHeaderExample );
