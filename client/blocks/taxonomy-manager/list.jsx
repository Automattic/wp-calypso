/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import {
	get,
	includes,
	filter,
	map,
	noop,
	reduce,
	union,
} from 'lodash';
import WindowScroller from 'react-virtualized/WindowScroller';

/**
 * Internal dependencies
 */
import VirtualList from 'components/virtual-list';
import ListItem from './list-item';
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import { decodeEntities } from 'lib/formatting';
import QueryTerms from 'components/data/query-terms';
import QuerySiteSettings from 'components/data/query-site-settings';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import {
	isRequestingTermsForQueryIgnoringPage,
	getTermsLastPageForQuery,
	getTermsForQueryIgnoringPage,
} from 'state/terms/selectors';
import { deleteTerm } from 'state/terms/actions';

/**
 * Constants
 */
const DEFAULT_TERMS_PER_PAGE = 100;
const LOAD_OFFSET = 10;
const ITEM_HEIGHT = 55;

export class TaxonomyManagerList extends Component {
	static propTypes = {
		terms: PropTypes.array,
		taxonomy: PropTypes.string,
		search: PropTypes.string,
		siteId: PropTypes.number,
		translate: PropTypes.func,
		lastPage: PropTypes.number,
		onTermClick: PropTypes.func,
	};

	static defaultProps = {
		loading: true,
		terms: [],
		onNextPage: noop,
		onTermClick: noop,
	};

	state = {
		requestedPages: [ 1 ],
		itemToDelete: null
	};

	componentWillMount() {
		this.termIds = map( this.props.terms, 'ID' );
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.terms !== this.props.terms ) {
			this.termIds = map( this.props.terms, 'ID' );
		}
	}

	getTermChildren( termId ) {
		const { terms } = this.props;
		return filter( terms, { parent: termId } );
	}

	getItemHeight = ( item, _recurse = false ) => {
		if ( ! item ) {
			return ITEM_HEIGHT;
		}

		// if item has a parent, and parent is in payload, height is already part of parent
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return 0;
		}

		return reduce( this.getTermChildren( item.ID ), ( memo, childItem ) => {
			return memo + this.getItemHeight( childItem, true );
		}, ITEM_HEIGHT );
	};

	getRowHeight = ( { index } ) => {
		return this.getItemHeight( this.getItem( index ) );
	};

	closeDeleteDialog = ( action ) => {
		if ( action === 'delete' ) {
			const item = this.state.itemToDelete;
			const { siteId, taxonomy } = this.props;
			this.props.deleteTerm( siteId, taxonomy, item.ID, item.slug );
		}
		this.setState( {
			itemToDelete: null
		} );
	};

	getItem( index ) {
		if ( this.props.terms ) {
			return this.props.terms[ index ];
		}
	}

	renderItem( item, _recurse = false ) {
		// if item has a parent and it is in current props.terms, do not render
		if ( item.parent && ! _recurse && includes( this.termIds, item.parent ) ) {
			return;
		}

		const children = this.getTermChildren( item.ID );
		const { onTermClick, defaultTerm, translate } = this.props;
		const itemId = item.ID;
		const isDefault = defaultTerm === itemId;
		const name = decodeEntities( item.name ) || translate( 'Untitled' );
		const onClick = () => {
			onTermClick( item );
		};
		const onDelete = () => {
			this.setState( {
				itemToDelete: item
			} );
		};

		return (
			<div key={ 'term-wrapper-' + itemId } className="taxonomy-manager__list-item">
				<CompactCard
					onClick={ onClick }
					key={ itemId }
					className="taxonomy-manager__list-item-card">
					<ListItem
						name={ name }
						postCount={ item.post_count }
						isDefault={ isDefault }
						onClick={ onClick }
						onDelete={ onDelete }
					/>
				</CompactCard>
				{ children.length > 0 && (
					<div className="taxonomy-manager__nested-list">
						{ children.map( ( child ) => this.renderItem( child, true ) ) }
					</div>
				) }
			</div>
		);
	}

	renderRow = ( { index } ) => {
		const item = this.getItem( index );
		if ( item ) {
			return this.renderItem( item );
		}

		return (
			<CompactCard className="taxonomy-manager__list-item is-placeholder">
				<span className="taxonomy-manager__label">
					{ this.props.translate( 'Loading…' ) }
				</span>
			</CompactCard>
		);
	}

	requestPages = pages => {
		this.setState( {
			requestedPages: union( this.state.requestedPages, pages )
		} );
	}

	render() {
		const { loading, siteId, taxonomy, terms, translate, lastPage, query } = this.props;
		const classes = classNames( 'taxonomy-manager', {
			'is-loading': loading
		} );
		const deleteDialogButtons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'OK' ), isPrimary: true },
		];
		const hasDefaultSetting = taxonomy === 'category';

		return (
			<div className={ classes }>
				{ this.state.requestedPages.map( page => (
					<QueryTerms
						key={ `query-${ page }` }
						siteId={ siteId }
						taxonomy={ taxonomy }
						query={ { ...query, page } } />
				) ) }
				{ hasDefaultSetting && <QuerySiteSettings siteId={ siteId } /> }

				<WindowScroller>
					{ ( { height, scrollTop } ) => (
						<VirtualList
							items={ terms }
							lastPage={ lastPage }
							loading={ loading }
							getRowHeight={ this.getRowHeight }
							renderRow={ this.renderRow }
							onRequestPages={ this.requestPages }
							perPage={ DEFAULT_TERMS_PER_PAGE }
							loadOffset={ LOAD_OFFSET }
							searching={ query.search && query.search.length }
							defaultRowHeight={ ITEM_HEIGHT }
							height={ height }
							scrollTop={ scrollTop }
						/>
				) }
				</WindowScroller>

				<Dialog
					isVisible={ !! this.state.itemToDelete }
					buttons={ deleteDialogButtons }
					onClose={ this.closeDeleteDialog }
				>
					<p>{ translate( 'Are you sure you want to permanently delete this item?' ) }</p>
				</Dialog>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { taxonomy, query } = ownProps;
	const siteId = getSelectedSiteId( state );
	const siteSettings = getSiteSettings( state, siteId );

	return {
		loading: isRequestingTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		terms: getTermsForQueryIgnoringPage( state, siteId, taxonomy, query ),
		lastPage: getTermsLastPageForQuery( state, siteId, taxonomy, query ),
		defaultTerm: taxonomy === 'category' ? get( siteSettings, [ 'default_category' ] ) : false,
		siteId,
		query
	};
}, { deleteTerm } )( localize( TaxonomyManagerList ) );
