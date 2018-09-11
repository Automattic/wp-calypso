/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import GridiconArrowRight from 'gridicons/dist/arrow-right';
import GridiconArrowLeft from 'gridicons/dist/arrow-left';
import isRtlSelector from 'state/selectors/is-rtl';

export const PlansSkipButton = ( { onClick, isRtl, translate = identity } ) => (
	<div className="plans-skip-button">
		<Button onClick={ onClick }>
			{ translate( 'Start with free' ) }
			{ isRtl ? <GridiconArrowLeft size={ 18 } /> : <GridiconArrowRight size={ 18 } /> }
		</Button>
	</div>
);

export default connect( state => ( {
	isRtl: isRtlSelector( state ),
} ) )( localize( PlansSkipButton ) );
