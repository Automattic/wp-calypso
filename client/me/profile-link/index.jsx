/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import safeProtocolUrl from 'lib/safe-protocol-url';
import eventRecorder from 'me/event-recorder';
import { withoutHttp } from 'lib/url';
import Button from 'components/button';

export default React.createClass( {

	displayName: 'ProfileLink',

	mixins: [ eventRecorder ],

	getDefaultProps() {
		return {
			imageSize: 100,
			title: '',
			url: '',
			slug: '',
			isPlaceholder: false
		};
	},

	propTypes: {
		imageSize: PropTypes.number,
		title: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		slug: PropTypes.string.isRequired
	},

	renderRemove() {
		return (
			<Button borderless icon className="profile-link__remove"
				onClick={ this.recordClickEvent( 'Remove Link Next to Site', this.props.onRemoveLink ) }
			>
			<Gridicon icon="cross" /></Button>
		);
	},

	render() {
		const classes = classNames( {
				'profile-link': true,
				'is-placeholder': this.props.isPlaceholder
			} ),
			imageSrc = '//s1.wp.com/mshots/v1/' + encodeURIComponent( this.props.url ) + '?w=' + this.props.imageSize + '&h=64',
			linkHref = this.props.isPlaceholder ? null : safeProtocolUrl( this.props.url );

		return (
			<li className={ classes }>
				{
					this.props.isPlaceholder
					? <div className="profile-link__image-link" />
					: <a
						href={ linkHref }
						className="profile-link__image-link" target="_blank" rel="noopener noreferrer"
						onClick={ this.recordClickEvent( 'Profile Links Site Images Link' ) }
					>
						<img className="profile-link__image" src={ imageSrc } />
					</a>
				}
				<a href={ linkHref } target="_blank" rel="noopener noreferrer" onClick={ this.recordClickEvent( 'Profile Links Site Link' ) }>
					<span className="profile-link__title">
						{ this.props.title }
					</span>
					<span className="profile-link__url">
						{ withoutHttp( this.props.url ) }
					</span>
				</a>

				{ this.props.isPlaceholder ? null : this.renderRemove() }
			</li>
		);
	}
} );
