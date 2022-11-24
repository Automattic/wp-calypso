import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Link } from 'react-router-dom';

const ConditionalLink = ( { active, ...props } ) => {
	if ( active ) {
		return <Link to={ props.href } { ...props } />;
	}
	return <a { ...props }></a>;
};

class SegmentedControlItem extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		path: PropTypes.string,
		selected: PropTypes.bool,
		title: PropTypes.string,
		value: PropTypes.string,
		onClick: PropTypes.func,
		index: PropTypes.number,
		isPlansInsideStepper: PropTypes.bool,
	};

	static defaultProps = {
		selected: false,
		isPlansInsideStepper: false,
	};

	handleKeyEvent = ( event ) => {
		switch ( event.keyCode ) {
			case 13: // enter
			case 32: // space
				event.preventDefault();
				document.activeElement.click();
				break;
		}
	};

	render() {
		const itemClassName = classNames( {
			'segmented-control__item': true,
			'is-selected': this.props.selected,
		} );

		const linkClassName = classNames( 'segmented-control__link', {
			[ `item-index-${ this.props.index }` ]: this.props.index != null,
		} );

		return (
			<li className={ itemClassName } role="none">
				<ConditionalLink
					active={ this.props.isPlansInsideStepper }
					href={ this.props.path }
					className={ linkClassName }
					onClick={ this.props.onClick }
					title={ this.props.title }
					data-e2e-value={ this.props.value }
					role="radio"
					tabIndex={ 0 }
					aria-checked={ this.props.selected }
					onKeyDown={ this.handleKeyEvent }
				>
					<span className="segmented-control__text">{ this.props.children }</span>
				</ConditionalLink>
			</li>
		);
	}
}

export default SegmentedControlItem;
