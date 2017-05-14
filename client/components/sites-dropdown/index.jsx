/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import SiteSelector from 'components/site-selector';
import { getSite } from 'state/sites/selectors';
import {
	getPrimarySiteId,
} from 'state/selectors';

export class SitesDropdown extends PureComponent {
	static propTypes = {
		selectedSiteId: PropTypes.number,
		showAllSites: PropTypes.bool,
		onClose: PropTypes.func,
		onSiteSelect: PropTypes.func,
		filter: PropTypes.func,
		isPlaceholder: PropTypes.bool,

		// Redux-provided
		initialSiteId: PropTypes.number.isRequired,
		selectedSite: PropTypes.object,
	}

	static defaultProps = {
		showAllSites: false,
		onClose: noop,
		onSiteSelect: noop,
		isPlaceholder: false
	}

	constructor( props ) {
		super( props );

		// needed to be done in constructor b/c spy tests
		this.selectSite = this.selectSite.bind( this );
		this.toggleOpen = this.toggleOpen.bind( this );
		this.onClose = this.onClose.bind( this );
	}

	state = { open: false }

	componentDidMount() {
		const { initialSiteId, setSelectedSiteSlug } = this.props;
		setSelectedSiteSlug( initialSiteId );
	}

	selectSite( siteSlug ) {
		this.props.onSiteSelect( siteSlug );
		this.props.setSelectedSiteSlug( siteSlug );
		this.setState( {
			open: false
		} );
	}

	toggleOpen() {
		this.setState( { open: ! this.state.open } );
	}

	onClose( e ) {
		this.setState( { open: false } );
		this.props.onClose && this.props.onClose( e );
	}

	render() {
		const selectedSiteSlug = get( this.props.selectedSite, 'slug', null );

		return (
			<div className={ classNames( 'sites-dropdown', { 'is-open': this.state.open } ) }>
				<div className="sites-dropdown__wrapper">
					<div
						className="sites-dropdown__selected"
						onClick={ this.toggleOpen } >
						{
							this.props.isPlaceholder
							? <SitePlaceholder />
							: <Site site={ this.props.selectedSite } indicator={ false } />
						}
						<Gridicon icon="chevron-down" />
					</div>
					{ this.state.open &&
						<SiteSelector
							autoFocus={ true }
							onClose={ this.onClose }
							onSiteSelect={ this.selectSite }
							selected={ selectedSiteSlug }
							hideSelected={ true }
							filter={ this.props.filter }
						/>
					}
				</div>
			</div>
		);
	}
}

const Connected = connect(
	( state, { selectedSiteId, selectedSiteSlug } ) => {
		const initialSiteId = selectedSiteId ||
			getPrimarySiteId( state );

		const selectedSite = selectedSiteSlug
			? getSite( state, selectedSiteSlug )
			: undefined;

		return {
			initialSiteId,
			selectedSite,
		};
	}
)( SitesDropdown );

/*
 * A container for component state that can then be passed to SitesDropdown's
 * Redux-connected counterpart.
 */
export default class SitesDropdownWrapper extends PureComponent {
	state = { selectedSiteSlug: null }

	setSelectedSiteSlug = ( slug ) => {
		this.setState( { selectedSiteSlug: slug } );
	}

	render() {
		return <Connected
			selectedSiteSlug={ this.state.selectedSiteSlug }
			setSelectedSiteSlug={ this.setSelectedSiteSlug }
			{ ...this.props } />;
	}
}
