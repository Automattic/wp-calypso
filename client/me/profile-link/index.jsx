/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import safeProtocolUrl from 'lib/safe-protocol-url';
import { recordGoogleEvent } from 'state/analytics/actions';
import { withoutHttp } from 'lib/url';

/**
 * Style dependencies
 */
import './style.scss';

class ProfileLink extends React.Component {
	static defaultProps = {
		imageSize: 100,
		title: '',
		url: '',
		slug: '',
		isPlaceholder: false,
	};

	static propTypes = {
		imageSize: PropTypes.number,
		title: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		slug: PropTypes.string.isRequired,
	};

	recordClickEvent = ( action ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	getClickHandler = ( action ) => {
		return () => this.recordClickEvent( action );
	};

	handleRemoveButtonClick = () => {
		this.recordClickEvent( 'Remove Link Next to Site' );
		this.props.onRemoveLink();
	};

	renderRemove() {
		return (
			<Button borderless className="profile-link__remove" onClick={ this.handleRemoveButtonClick }>
				<Gridicon icon="cross" />
			</Button>
		);
	}

	render() {
		const classes = classNames( {
				'profile-link': true,
				'is-placeholder': this.props.isPlaceholder,
			} ),
			imageSrc =
				'//s1.wp.com/mshots/v1/' +
				encodeURIComponent( this.props.url ) +
				'?w=' +
				this.props.imageSize +
				'&h=64',
			linkHref = this.props.isPlaceholder ? null : safeProtocolUrl( this.props.url );

		return (
			<li className={ classes }>
				{ this.props.isPlaceholder ? (
					<div className="profile-link__image-link" />
				) : (
					<a
						href={ linkHref }
						className="profile-link__image-link"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.getClickHandler( 'Profile Links Site Images Link' ) }
					>
						<img className="profile-link__image" src={ imageSrc } />
					</a>
				) }
				<a
					href={ linkHref }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ this.getClickHandler( 'Profile Links Site Link' ) }
				>
					<span className="profile-link__title">{ this.props.title }</span>
					<span className="profile-link__url">{ withoutHttp( this.props.url ) }</span>
				</a>

				{ this.props.isPlaceholder ? null : this.renderRemove() }
			</li>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( ProfileLink );
