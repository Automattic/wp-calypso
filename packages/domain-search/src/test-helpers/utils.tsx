import { useMutation } from '@tanstack/react-query';

export const MockMutation = ( { mutationPromise }: { mutationPromise: Promise< unknown > } ) => {
	const { mutate } = useMutation( {
		mutationFn: async () => {
			await mutationPromise;
			return Promise.resolve();
		},
	} );

	return <button onClick={ () => mutate() }>Click me</button>;
};
