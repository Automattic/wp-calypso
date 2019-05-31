/** @format */

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
	setSearchResults = results => {
		if ( results && results.length ) {
			this.setState( { candidateVerticals: results }, () =>
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
	} );

	/**
	 * Searches the API results for a direct match on the user search query.
	 *
	 * @param {String} value       Search query array
	 * @returns {Object|undefined} An object from the vertical results array
	 */
	searchForVerticalMatches = ( value = '' ) =>
		find(
			this.props.verticals,
			item => item.verticalName.toLowerCase() === value.toLowerCase().trim()
		);

	/**
	 * Callback to be passed to consuming component when the search value is updated.
	 * TODO: once the siteVertical state got simplified, this can be removed.
	 *
	 * @param {Object} verticalData An object from the vertical results array
	 * @param {String} value Search query array
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
	 * @param {String}  value                The new search value
	 */
	onSiteTopicChange = value => {
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
	 * @returns {Array} The array of vertical values.
	 */
	getSuggestions = () => this.state.candidateVerticals.map( vertical => vertical.verticalName );

	render() {
		const { autoFocus, defaultVerticalSearchTerm, placeholder, siteType, translate } = this.props;
		const { inputValue, railcar } = this.state;
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
					suggestions={ this.getSuggestions() }
					value={ inputValue }
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					isSearching={ this.isVerticalSearchPending() }
					railcar={ railcar }
				/>
				{ shouldShowPopularTopics && <PopularTopics onSelect={ this.onSiteTopicChange } /> }
			</>
		);
	}
}

export default localize(
	connect(
		( state, ownProps ) => {
			const siteType = getSiteType( state );
			const defaultVerticalSearchTerm =
				getSiteTypePropertyValue( 'slug', siteType, 'defaultVertical' ) || '';
			return {
				siteType,
				defaultVerticalSearchTerm,
				verticals: getVerticals( state, ownProps.searchValue, siteType ) || [],
				defaultVertical: get( getVerticals( state, defaultVerticalSearchTerm, siteType ), '0', {} ),
			};
		},
		null
	)( SiteVerticalsSuggestionSearch )
);
