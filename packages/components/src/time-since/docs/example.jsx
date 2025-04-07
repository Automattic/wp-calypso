import TimeSince from '..';

const TimeSinceExample = () => {
	return (
		<div>
			<div>
				<TimeSince date={ new Date( Date.now() - 30 * 1000 ) } />
			</div>
			<div>
				<TimeSince date={ new Date( Date.now() - 5 * 60 * 1000 ) } />
			</div>
			<div>
				<TimeSince date={ new Date( Date.now() - 3 * 24 * 60 * 60 * 1000 ) } />
			</div>
			<div>
				<TimeSince date={ new Date( Date.now() - 5 * 30 * 24 * 60 * 60 * 1000 ) } />
			</div>
		</div>
	);
};

TimeSinceExample.displayName = 'TimeSinceExample';

export default TimeSinceExample;
