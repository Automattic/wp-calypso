import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { requestTags } from 'calypso/state/reader/tags/items/actions';

const QueryReaderTag = ( { tag } ) => {
	const locale = useSelector( ( state ) => getCurrentUserLocale( state ) );
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestTags( tag, locale ) );
	}, [ dispatch, locale, tag ] );
	return null;
};

QueryReaderTag.propTypes = {
	tag: PropTypes.string.isRequired,
};

export default QueryReaderTag;
