import { HelpCommand } from '../commands/help.ts';
import { BaseCommand } from './base-command.ts';

/**
 * A command with pre configured command's and option's:
 *
 *  - command's:
 *      help            Output's autogenerated help.
 *  - option's:
 *      -h, --help      Output's autogenerated help.
 *      -V, --version   Output's version number
 */
export class DefaultCommand extends BaseCommand {

    public constructor() {

        super();

        this.option( '-h, --help [arg:boolean]', 'Show this help.', {
                standalone: true,
                action: () => {
                    this.help();
                    Deno.exit( 0 );
                }
            } )

            .option( '-V, --version [arg:boolean]', 'Show the version number for this program.', {
                standalone: true,
                action: () => {
                    this.log( this.ver );
                    Deno.exit( 0 );
                }
            } )

            .command( 'help', new HelpCommand( this ) )

            .reset();
    }

    public command( nameAndArguments: string, cmd?: BaseCommand | string, override?: boolean ): this {
        return super.command( nameAndArguments, cmd || new DefaultCommand(), override );
    }
}
