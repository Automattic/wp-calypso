import { useMemo } from 'react';
import useCourseQuery from './use-course-query';
import type { Course, VideoSlug } from './types';

interface Result {
	course?: Course;
	videoSlugs: VideoSlug[];
	completedVideoSlugs: VideoSlug[];
	isCourseComplete: boolean;
}

const useCourseData = ( courseSlug: string ): Result => {
	const { data } = useCourseQuery( courseSlug );

	const videoSlugs = useMemo( () => ( data?.videos ? Object.keys( data.videos ) : [] ), [
		data?.videos,
	] );

	const completedVideoSlugs = useMemo( () => {
		if ( ! data?.completions ) {
			return [];
		}

		return Object.keys( data.completions ).filter(
			( videoSlug ) => !! data.completions[ videoSlug ]
		);
	}, [ data?.completions ] );

	const isCourseComplete = useMemo(
		() => completedVideoSlugs.length > 0 && completedVideoSlugs.length === videoSlugs.length,
		[ videoSlugs.length, completedVideoSlugs.length ]
	);

	return {
		course: data,
		videoSlugs,
		completedVideoSlugs,
		isCourseComplete,
	};
};

export default useCourseData;
