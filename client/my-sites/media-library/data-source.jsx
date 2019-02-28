/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { find, includes } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ScreenReaderText from 'components/screen-reader-text';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import GooglePhotosIcon from './google-photos-icon';
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

	storeButtonRef = ref => ( this.buttonRef = ref );

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

	getSources = () => {
		const { disabledSources, translate } = this.props;
		const sources = [
			{
				value: '',
				label: translate( 'WordPress library' ),
				icon: <Gridicon icon="image" size={ 24 } />,
			},
			{
				value: 'google_photos',
				label: translate( 'Google Photos library' ),
				icon: <GooglePhotosIcon />,
			},
		];
		if ( config.isEnabled( 'external-media/free-photo-library' ) ) {
			sources.push( {
				value: 'pexels',
				label: translate( 'Free photo library' ),
				icon: <Gridicon icon="image-multiple" size={ 24 } />,
			} );
		}
		return sources.filter( ( { value } ) => ! includes( disabledSources, value ) );
	};

	renderScreenReader( selected ) {
		return <ScreenReaderText>{ selected && selected.label }</ScreenReaderText>;
	}

	renderMenuItems( sources ) {
		return sources.map( ( { icon, label, value } ) => (
			<PopoverMenuItem action={ value } key={ value } onClick={ this.changeSource }>
				{ icon }
				{ label }
			</PopoverMenuItem>
		) );
	}

	render() {
		const { translate, source } = this.props;
		const sources = this.getSources();
		const currentSelected = find( sources, item => item.value === source );
		const classes = classnames( 'media-library__datasource', {
			'is-single-source': 1 === sources.length,
		} );
		const buttonClasses = classnames( 'button media-library__source-button', {
			'is-open': this.state.popover,
		} );

		if ( ! config.isEnabled( 'external-media' ) && ! sources.length ) {
			return null;
		}

		return (
			<div className={ classes }>
				<Button
					borderless
					ref={ this.storeButtonRef }
					className={ buttonClasses }
					onClick={ this.togglePopover }
					title={ translate( 'Choose media library source' ) }
				>
					{ currentSelected && currentSelected.icon }
					{ this.renderScreenReader( currentSelected ) }

					{ sources.length > 1 && (
						<Fragment>
							<Gridicon icon="chevron-down" size={ 18 } />
							<PopoverMenu
								context={ this.buttonRef }
								isVisible={ this.state.popover }
								position="bottom right"
								onClose={ this.togglePopover }
								className="is-dialog-visible media-library__header-popover"
							>
								{ this.renderMenuItems( sources ) }
							</PopoverMenu>
						</Fragment>
					) }
				</Button>
			</div>
		);
	}
}

export default localize( MediaLibraryDataSource );
