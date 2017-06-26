/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StatsContentText from '../stats-module/content-text';

const periodLabel = ( translate, period ) => {
	if ( period.period === 'day' ) {
		return translate( 'this day' );
	}
	if ( period.period === 'week' ) {
		return translate( 'this week' );
	}
	if ( period.period === 'month' ) {
		return translate( 'this month' );
	}
	return '';
};

const SinglePost = localize( ( { translate, post, period } ) => {
	const yearsAgo = period.startOf
		.clone()
		.startOf( 'year' )
		.diff( moment( post.date ).startOf( 'year' ), 'years' );
	return (
		<StatsContentText>
			<p>
				<Gridicon icon="calendar" size={ 18 } />
				{ translate(
					'%(yearsAgo)d year ago on %(period)s, {{href}}%(title)s{{/href}} was published.',
					'%(yearsAgo)d years ago on %(period)s, {{href}}%(title)s{{/href}} was published.',
					{
						count: yearsAgo,
						args: {
							yearsAgo,
							period: periodLabel( translate, period ),
							title: post.title,
						},
						components: {
							href: <a href={ post.URL } target="_blank" rel="noopener noreferrer" />,
						},
						comment: 'Sentence showing what post was published some years ago',
					},
				) }
			</p>
		</StatsContentText>
	);
} );

export default SinglePost;
