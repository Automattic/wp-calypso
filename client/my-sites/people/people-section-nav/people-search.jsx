import PropTypes from 'prop-types';
import Search from 'calypso/components/search';
import urlSearch from 'calypso/lib/url-search';

export const PeopleSearch = ( props ) => {
	const { doSearch, search, placeholder } = props;

	return (
		<Search
			pinned
			fitsContainer
			onSearch={ doSearch }
			initialValue={ search }
			delaySearch
			placeholder={ placeholder }
			analyticsGroup="People"
		/>
	);
};

PeopleSearch.propTypes = {
	doSearch: PropTypes.func.isRequired,
	search: PropTypes.string,
};

export default urlSearch( PeopleSearch );
