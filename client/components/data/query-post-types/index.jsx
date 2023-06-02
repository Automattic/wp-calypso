import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestPostTypes } from 'calypso/state/post-types/actions';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { getSiteOption } from 'calypso/state/sites/selectors';

const getPostTypeSetting = ( siteId, settingName ) => ( state ) =>
	getSiteSetting( state, siteId, settingName );

function QueryPostTypes( { siteId } ) {
	const dispatch = useDispatch();
	const themeSlug = useSelector( ( state ) => getSiteOption( state, siteId, 'theme_slug' ) );
	const jetpackTestimonial = useSelector( getPostTypeSetting( siteId, 'jetpack_testimonial' ) );
	const jetpackPortfolio = useSelector( getPostTypeSetting( siteId, 'jetpack_portfolio' ) );

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestPostTypes( siteId ) );
		}
	}, [ dispatch, siteId, themeSlug, jetpackTestimonial, jetpackPortfolio ] );

	return null;
}

QueryPostTypes.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryPostTypes;
