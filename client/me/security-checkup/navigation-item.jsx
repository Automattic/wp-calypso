import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import MaterialIcon from 'calypso/components/material-icon';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

const SecurityCheckupNavigationItemContents = function ( props ) {
	const { materialIcon, materialIconStyle, text, description } = props;
	return (
		<Fragment>
			<MaterialIcon
				icon={ materialIcon }
				style={ materialIconStyle }
				className="security-checkup__nav-item-icon"
			/>
			<div>
				<div>{ text }</div>
				<small>{ description }</small>
			</div>
		</Fragment>
	);
};

class SecurityCheckupNavigationItem extends Component {
	static propTypes = {
		description: PropTypes.node,
		external: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		materialIcon: PropTypes.string,
		materialIconStyle: PropTypes.string,
		onClick: PropTypes.func,
		path: PropTypes.string,
		text: PropTypes.string,
	};

	render() {
		if ( this.props.isPlaceholder ) {
			return <VerticalNavItem isPlaceholder={ true } />;
		}

		return (
			<VerticalNavItem
				path={ this.props.path }
				onClick={ this.props.onClick }
				external={ this.props.external }
				className="security-checkup__nav-item"
			>
				<SecurityCheckupNavigationItemContents
					materialIcon={ this.props.materialIcon }
					materialIconStyle={ this.props.materialIconStyle ?? 'outline' }
					text={ this.props.text }
					description={ this.props.description }
				/>
			</VerticalNavItem>
		);
	}
}

export default SecurityCheckupNavigationItem;
