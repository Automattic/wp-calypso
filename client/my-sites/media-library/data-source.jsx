import { Button, ScreenReaderText, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { find, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import GooglePhotosIcon from './google-photos-icon';
import OpenverseIcon from './openverse-icon';
import PexelsIcon from './pexels-icon';

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
		const nextValue = ! this.state.popover;
		this.setState( { popover: nextValue } );
		recordTracksEvent( 'calypso_media_data_source_toggle', { expanded: nextValue } );
	};

	changeSource = ( newSource ) => () => {
		if ( newSource !== this.props.source ) {
			this.props.onSourceChange( newSource );
			recordTracksEvent( 'calypso_media_data_source_change', {
				old_source: this.props.source,
				new_source: newSource,
			} );
		}
	};

	getSources = () => {
		const { disabledSources, translate, ignorePermissions, canUserUploadFiles } = this.props;
		const includeExternalMedia = ignorePermissions || canUserUploadFiles;
		const sources = [
			{
				value: '',
				label: translate( 'Media library' ),
				icon: <Gridicon icon="image" size={ 24 } />,
			},
		];
		if ( includeExternalMedia ) {
			sources.push( {
				value: 'google_photos',
				label: translate( 'Google Photos' ),
				icon: <GooglePhotosIcon className="gridicon" />,
			} );
		}
		if ( includeExternalMedia ) {
			sources.push( {
				value: 'pexels',
				label: translate( 'Pexels free photos' ),
				icon: <PexelsIcon className="gridicon" />, // eslint-disable-line wpcalypso/jsx-classname-namespace
			} );
		}
		if ( includeExternalMedia ) {
			sources.push( {
				value: 'openverse',
				label: translate( 'Openverse free photos' ),
				icon: <OpenverseIcon className="gridicon" />, // eslint-disable-line wpcalypso/jsx-classname-namespace
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
		const classes = clsx( 'media-library__datasource', {
			'is-single-source': 1 === sources.length,
		} );
		const buttonClasses = clsx( 'button media-library__source-button', {
			'is-open': this.state.popover,
		} );

		if ( ! sources.length ) {
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
