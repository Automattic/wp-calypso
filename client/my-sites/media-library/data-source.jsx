/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { find, includes } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button, ScreenReaderText } from '@automattic/components';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import GooglePhotosIcon from './google-photos-icon';
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';

export class MediaLibraryDataSource extends Component {
	static propTypes = {
		source: PropTypes.string.isRequired,
		onSourceChange: PropTypes.func.isRequired,
		disabledSources: PropTypes.array,
		ignorePermissions: PropTypes.bool,
	};

	static defaultProps = {
		disabledSources: [],
		ignorePermissions: false,
	};

	state = { popover: false };

	storeButtonRef = ( ref ) => ( this.buttonRef = ref );

	togglePopover = () => {
		this.setState( { popover: ! this.state.popover } );
	};

	changeSource = ( newSource ) => () => {
		if ( newSource !== this.props.source ) {
			this.props.onSourceChange( newSource );
		}
	};

	getSources = () => {
		const { disabledSources, translate, ignorePermissions, canUserUploadFiles } = this.props;
		const includeExternalMedia = ignorePermissions || canUserUploadFiles;
		const sources = [
			{
				value: '',
				label: translate( 'WordPress library' ),
				icon: <Gridicon icon="image" size={ 24 } />,
			},
		];
		if ( config.isEnabled( 'external-media/google-photos' ) && includeExternalMedia ) {
			sources.push( {
				value: 'google_photos',
				label: translate( 'Google Photos library' ),
				icon: <GooglePhotosIcon />,
			} );
		}
		if ( config.isEnabled( 'external-media/free-photo-library' ) && includeExternalMedia ) {
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
			<PopoverMenuItem key={ value } data-source={ value } onClick={ this.changeSource( value ) }>
				{ icon }
				{ label }
			</PopoverMenuItem>
		) );
	}

	render() {
		const { translate, source } = this.props;
		const sources = this.getSources();
		const currentSelected = find( sources, ( item ) => item.value === source );
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
					<Gridicon icon="chevron-down" size={ 18 } />
				</Button>
				{ sources.length > 1 && (
					<PopoverMenu
						context={ this.buttonRef }
						isVisible={ this.state.popover }
						position="bottom right"
						onClose={ this.togglePopover }
						className="is-dialog-visible media-library__header-popover"
					>
						{ this.renderMenuItems( sources ) }
					</PopoverMenu>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	canUserUploadFiles: canCurrentUser( state, getSelectedSiteId( state ), 'upload_files' ),
} );

export default connect( mapStateToProps )( localize( MediaLibraryDataSource ) );
