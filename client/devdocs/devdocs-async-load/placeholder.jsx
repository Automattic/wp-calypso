import { range } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import Main from 'calypso/components/main';

export default class DevdocsAsyncLoadPlaceholder extends PureComponent {
	static propTypes = {
		count: PropTypes.number.isRequired,
	};

	render() {
		return (
			<Main className="devdocs devdocs-async-load__placeholder">
				{ range( this.props.count ).map( ( element, index ) => (
					<div key={ `devdocs-placeholder-index-${ index }` }>
						<SitePlaceholder />
					</div>
				) ) }
			</Main>
		);
	}
}
