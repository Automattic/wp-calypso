import { calcMinutesToRead } from 'calypso/lib/time-to-read';

export default function addMinutesToRead( post ) {
	post.minutes_to_read = calcMinutesToRead( post.word_count );
	return post;
}
