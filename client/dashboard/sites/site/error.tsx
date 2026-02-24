import UnknownError from '../../app/500';

export default function Error( { error }: { error: Error } ) {
	return <UnknownError error={ error } />;
}
