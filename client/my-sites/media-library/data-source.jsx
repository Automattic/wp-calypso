/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import config from 'config';

export class MediaLibraryDataSource extends Component {
	static propTypes = {
		source: PropTypes.string.isRequired,
		onSourceChange: PropTypes.func.isRequired,
		disabledSources: PropTypes.array,
	};

	static defaultProps = {
		disabledSources: [],
	};

	constructor( props ) {
		super( props );

		this.state = { popover: false };
	}

	togglePopover = () => {
		this.setState( { popover: ! this.state.popover } );
	};

	changeSource = item => {
		const { target } = item;
		const action = target.getAttribute( 'action' )
			? target.getAttribute( 'action' )
			: target.parentNode.getAttribute( 'action' );
		const newSource = action ? action : '';

		if ( newSource !== this.props.source ) {
			this.props.onSourceChange( newSource );
		}
	};

	renderScreenReader( selected ) {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return <span className="screen-reader-text">{ selected && selected.label }</span>;
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderMenuItems( sources ) {
		return sources
			.filter( item => -1 === this.props.disabledSources.indexOf( item.value ) )
			.map( item => (
				<PopoverMenuItem action={ item.value } key={ item.value } onClick={ this.changeSource }>
					{ item.icon }
					{ item.label }
				</PopoverMenuItem>
			) );
	}

	render() {
		const { translate, source } = this.props;
		const sources = [
			{
				value: '',
				label: translate( 'WordPress library' ),
				icon: <Gridicon icon="my-sites" size={ 24 } />,
			},
			{
				value: 'google_photos',
				label: translate( 'Photos from Your Google library' ),
				icon: <Gridicon icon="image" size={ 24 } />,
			},
		];
		const currentSelected = find( sources, item => item.value === source );
		const classes = classnames( {
			button: true,
			'media-library__source-button': true,
			'is-open': this.state.popover,
		} );

		if ( ! config.isEnabled( 'external-media' ) ) {
			return null;
		}

		return (
			<div className="media-library__datasource">
				<Button
					borderless
					ref="popoverMenuButton"
					className={ classes }
					onClick={ this.togglePopover }
					title={ translate( 'Choose media library source' ) }
				>
					{ currentSelected && currentSelected.icon }
					{ this.renderScreenReader( currentSelected ) }

					<PopoverMenu
						context={ this.refs && this.refs.popoverMenuButton }
						isVisible={ this.state.popover }
						position="bottom right"
						onClose={ this.togglePopover }
						className="is-dialog-visible media-library__header-popover"
					>
						{ this.renderMenuItems( sources ) }
					</PopoverMenu>
				</Button>
			</div>
		);
	}
}

export default localize( MediaLibraryDataSource );
