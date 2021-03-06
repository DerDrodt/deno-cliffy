import { Command } from '../../lib/command.ts';
import { assertEquals, assertThrowsAsync } from '../lib/assert.ts';

const cmd = new Command()
    .throwErrors()
    .option( '-f, --flag [value:string]', 'description ...' ).action( () => {} );

Deno.test( async function command_typeString_flag() {

    const { options, args } = await cmd.parse( [ '-f' ] );

    assertEquals( options, { flag: true } );
    assertEquals( args, [] );
} );

Deno.test( async function command_typeString_flagValue() {

    const { options, args } = await cmd.parse( [ '--flag', 'value' ] );

    assertEquals( options, { flag: 'value' } );
    assertEquals( args, [] );
} );

Deno.test( async function command_optionStandalone_flagCombineLong() {

    await assertThrowsAsync( async () => {
        await cmd.parse( [ '-f', 'value', 'unknown' ] );
    }, Error, 'Unknown command: unknown' );
} );

await Deno.runTests();
