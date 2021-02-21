/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MaterialIcon from 'calypso/components/material-icon';
import VerticalNavItem from 'calypso/components/vertical-nav/item';

const SecurityCheckupNavigationItemContents = function ( props ) {
	const { materialIcon, materialIconStyle, text, description } = props;
	return (
		<React.Fragment>
			<MaterialIcon
				icon={ materialIcon }
				style={ materialIconStyle }
				className="security-checkup__nav-item-icon"
			/>
			<div>
				<div>{ text }</div>
				<small>{ description }</small>
			</div>
		</React.Fragment>
	);
};

class SecurityCheckupNavigationItem extends React.Component {
	static propTypes = {
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
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
