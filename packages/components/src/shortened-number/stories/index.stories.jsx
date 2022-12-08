import ShortenedNumber from '..';

export default { title: 'Shortened Number' };

const ShortenedNumberExample = ( { value } ) => (
	<p>
		{ value } becomes <ShortenedNumber value={ value } />
	</p>
);

export const Default = () => (
	<div>
		<ShortenedNumberExample value={ 123 } />
		<ShortenedNumberExample value={ 12345 } />
		<ShortenedNumberExample value={ 12345678 } />
		<ShortenedNumberExample value={ 12345678901 } />
	</div>
);
