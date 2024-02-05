import z from 'zod';

const RoleSchema = z.object( {
	name: z.string(),
	display_name: z.string(),
	capabilities: z.record( z.boolean() ),
} );

export const SiteRolesResponseSchema = z.object( { roles: z.array( RoleSchema ) } );
