import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import DiscoverNavItem from './item';

class DiscoverNavigation extends PureComponent {
	static propTypes = {
		recommendedTags: PropTypes.arrayOf( PropTypes.object ),
	};

	static defaultProps = {
		recommendedTags: [],
	};

	render() {
		return (
			<div className="discover-stream__navigation">
				<DiscoverNavItem
					key="recommended"
					title={ translate( 'Recommended' ) }
					slug="recommended"
				/>
				{ this.props.recommendedTags.map( ( tag ) => {
					return <DiscoverNavItem key={ tag.slug } title={ tag.title } slug={ tag.slug } />;
				} ) }
			</div>
		);
	}
}

export default DiscoverNavigation;
