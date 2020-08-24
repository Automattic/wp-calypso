/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';
import { localize } from 'i18n-calypso';
import { v4 as uuid } from 'uuid';

/**
 * Internal dependencies
 */
import SuggestionSearch from 'components/suggestion-search';
import PopularTopics from 'components/site-verticals-suggestion-search/popular-topics';
import QueryVerticals from 'components/data/query-verticals';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getVerticals } from 'state/signup/verticals/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

/**
 * Style dependencies
 */
import './style.scss';

export class SiteVerticalsSuggestionSearch extends Component {
	static propTypes = {
		autoFocus: PropTypes.bool,
		defaultVertical: PropTypes.object,
		defaultVerticalSearchTerm: PropTypes.string,
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		searchValue: PropTypes.string,
		showPopular: PropTypes.bool,
		siteType: PropTypes.string,
		verticals: PropTypes.array,
		labelText: PropTypes.string,
	};

	static defaultProps = {
		autoFocus: false,
		defaultVertical: {},
		defaultVerticalSearchTerm: '',
		onChange: () => {},
		placeholder: '',
		searchValue: '',
		siteType: '',
		showPopular: false,
		verticals: [],
	};

	constructor( props ) {
		super( props );
		this.state = {
			railcar: this.getNewRailcar(),
			candidateVerticals: [],
			inputValue: props.searchValue,
		};
	}

	componentDidUpdate( prevProps ) {
		// The suggestion list should only be updated when the vertical suggestions results change.
		// Note: it's intentional to use object reference comparison here.
		// Since `verticals` props is connected from a redux state here, if the two references are identical,
		// we can safely say that the two content are identical, thanks to the immutability invariant of redux.
		if ( prevProps.verticals !== this.props.verticals ) {
			// It's safe here to call setState() because we prevent the indefinite loop by the wrapping condition.
			// See the official doc here: https://reactjs.org/docs/react-component.html#componentdidupdate
			this.setSearchResults( this.props.verticals );
		}
	}

	/**
	 * Show the popular topics component when the search field is empty and
	 * `props.showPopular` tell us to.
	 *
	 * @returns {Bool} Whether we should display the popular topics component.
	 */
	shouldShowPopularTopics = () => ! this.state.inputValue && this.props.showPopular;

	/**
	 * Checks for the existence of vertical results. If there are none we assume
	 *
	 * @returns {Bool} Whether we should display the popular topics component.
	 */
	isVerticalSearchPending = () => this.state.inputValue && 0 === this.props.verticals.length;

	/**
	 * Sets `state.candidateVerticals` with incoming vertical results.
	 *
	 * @param {Array} results Incoming vertical results
	 */
	setSearchResults = ( results ) => {
		if ( results && results.length ) {
			const candidateVerticals = this.getSuggestionsWithCategories( results );
			this.setState( { candidateVerticals }, () =>
				this.updateVerticalData(
					this.searchForVerticalMatches( this.state.inputValue ),
					this.state.inputValue
				)
			);
		}
	};

	getNewRailcar = () => ( {
		id: `${ uuid().replace( /-/g, '' ) }-site-vertical-suggestion`,
		fetch_algo: '/verticals',
		action: 'site_vertical_selected',
		ui_algo: 'signup/site-topic/related_1',
	} );

	/**
	 * Searches the API results for a direct match on the user search query.
	 *
	 * @param {string} value       Search query array
	 * @returns {object|undefined} An object from the vertical results array
	 */
	searchForVerticalMatches = ( value = '' ) =>
		find(
			this.props.verticals,
			( item ) => item.verticalName.toLowerCase() === value.toLowerCase().trim()
		);

	/**
	 * Callback to be passed to consuming component when the search value is updated.
	 * TODO: once the siteVertical state got simplified, this can be removed.
	 *
	 * @param {object} verticalData An object from the vertical results array
	 * @param {string} value Search query array
	 */
	updateVerticalData = ( verticalData, value = '' ) => {
		const trimmedValue = value.trim();
		this.props.onChange(
			verticalData || {
				isUserInputVertical: true,
				parent: '',
				preview: get( this.props.defaultVertical, 'preview', '' ),
				verticalId: '',
				verticalName: trimmedValue,
				verticalSlug: trimmedValue,
			}
		);
	};

	/**
	 * Callback to be passed to consuming component when the search field is updated.
	 *
	 * @param {string}  value                The new search value
	 */
	onSiteTopicChange = ( value ) => {
		const newState = {
			inputValue: value,
		};

		if ( value && value !== this.props.searchValue ) {
			newState.railcar = this.getNewRailcar();
		}

		this.setState( { ...newState } );

		// We debounce the update on the vertical while the user is typing
		// to prevent unnecessary site preview updates
		this.updateVerticalData( this.searchForVerticalMatches( value ), value );
	};

	/**
	 * Returns an array of vertical values - suggestions - that is consumable by `<SuggestionSearch />`
	 * We use the `this.state.candidateVerticals` array instead of `this.props.verticals`
	 * so `<SuggestionSearch />` has a list to filter in between requests.
	 *
	 * @param {Array} verticals verticals to be categorized
	 * @returns {Array} The array of vertical values.
	 */
	getSuggestionsWithCategories( verticals ) {
		const normalizedInput = this.state.inputValue.toLowerCase().trim();
		const includeRelated = normalizedInput.length > 2;

		return verticals
			.map( ( vertical ) => ( {
				label: vertical.verticalName,
				category: isRelatedVertical( vertical, normalizedInput )
					? this.props.translate( 'Related' )
					: undefined,
			} ) )
			.filter( ( suggestion ) => includeRelated || ! suggestion.category );
	}

	render() {
		const { autoFocus, defaultVerticalSearchTerm, placeholder, siteType, translate } = this.props;
		const { candidateVerticals, inputValue, railcar } = this.state;
		const shouldShowPopularTopics = this.shouldShowPopularTopics();
		const placeholderText = shouldShowPopularTopics
			? translate( 'Enter a topic or select from below.', {
					comment:
						'Text input field placeholder. Should be fewer than 35 chars to fit mobile width.',
			  } )
			: translate( 'Enter a topic.', {
					comment:
						'Text input field placeholder. Should be fewer than 35 chars to fit mobile width.',
			  } );

		return (
			<>
				<QueryVerticals
					searchTerm={ inputValue.trim() }
					siteType={ siteType }
					debounceTime={ 300 }
				/>
				<QueryVerticals searchTerm={ defaultVerticalSearchTerm } siteType={ siteType } />
				<SuggestionSearch
					id="siteTopic"
					placeholder={ placeholder || placeholderText }
					onChange={ this.onSiteTopicChange }
					suggestions={ candidateVerticals }
					value={ inputValue }
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					isSearching={ this.isVerticalSearchPending() }
					railcar={ railcar }
					aria-label={ this.props.labelText }
				/>
				{ shouldShowPopularTopics && <PopularTopics onSelect={ this.onSiteTopicChange } /> }
			</>
		);
	}
}

function isRelatedVertical( vertical, normalizedInput ) {
	return (
		! vertical.isUserInputVertical &&
		! vertical.verticalName.toLowerCase().includes( normalizedInput )
	);
}

export default localize(
	connect( ( state, ownProps ) => {
		const siteType = getSiteType( state );
		const defaultVerticalSearchTerm =
			getSiteTypePropertyValue( 'slug', siteType, 'defaultVertical' ) || '';
		return {
			siteType,
			defaultVerticalSearchTerm,
			verticals: getVerticals( state, ownProps.searchValue, siteType ) || [],
			defaultVertical: get( getVerticals( state, defaultVerticalSearchTerm, siteType ), '0', {} ),
		};
	}, null )( SiteVerticalsSuggestionSearch )
);
