# Cliffy - Command 

The complete solution for [Deno](https://deno.land/) command-line interfaces, inspired by [node.js's](http://nodejs.org) [commander.js](https://github.com/tj/commander.js/blob/master/Readme.md).

**WARNING:** This module is still under development. Not all features are fully implemented and it is possible you get some breaking changes if you upgrade to a newer version. If you find a bug or have a feature request feel free to create an issue.

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/c4spar/deno-cliffy?logo=github) ![GitHub Release Date](https://img.shields.io/github/release-date/c4spar/deno-cliffy?logo=github)

![Build Status](https://github.com/c4spar/deno-cliffy/workflows/ci/badge.svg?branch=master) ![Deno version](https://img.shields.io/badge/deno-v0.37.1-green?logo=deno) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/c4spar/deno-cliffy?logo=github) ![GitHub issues](https://img.shields.io/github/issues/c4spar/deno-cliffy?logo=github) ![GitHub licence](https://img.shields.io/github/license/c4spar/deno-cliffy?logo=github)

### Features

* ⭐️ chainable ⭐️
* ⭐️ short and long flags ⭐️
* ⭐️ sub-commands ⭐️
* ⭐️ aliases ⭐️
* ⭐️ depending & conflicting options ⭐️
* ⭐️ negatable options ⭐️
* ⭐️ type checking ⭐️
* ⭐️ custom type's ⭐️
* ⭐️ custom value processing ⭐️
* ⭐️ custom error handling ⭐️
* ⭐️ git style sub commands ⭐️
* ⭐️ environment variable's validation ⭐️
* ⭐️ auto generated help ⭐️
* ⭐️ out of the box support for shell completion's ⭐️

### Content

- [Creating a program](#creating-a-program)
- [Options](#options)
  - [Common option types: boolean, number and string](#common-option-types-boolean-number-and-string)
  - [List option types](#list-option-types)
  - [Custom option types](#custom-option-types)
  - [Variadic options](#variadic-options)
  - [Default option value](#default-option-value)
  - [Required options](#required-options)
  - [Negatable options](#negatable-options)
  - [Options which depends on other options](#options-which-depends-on-other-options)
  - [Options which conflicts with other options](#options-which-conflicts-with-other-options)
  - [Custom option processing](#custom-option-processing)
  - [Standalone options](#standalone-options)
  - [Specify an action for an option](#specify-an-action-for-an-option)
- [Commands](#commands)
  - [Action handler](#action-handler)
  - [Sub-commands](#sub-commands)
  - [Specify the argument syntax](#specify-the-argument-syntax)
  - [Git-style executable sub-commands](#git-style-executable-sub-commands)
  - [Override exit handling](#override-exit-handling)
  - [Specify environment variables](#specify-the-argument-syntax)
  - [Specify examples](#specify-examples)
- [Default options & commands](#default-options--commands)
  - [Version option](#version-option)
  - [Help option & command](#help-option--command)
  - [Completions command](#completions-command)
- [License](#license)

## Creating a program

To create a program with cliffy you can import the `Command` class from the cliffy module https://deno.land/x/cliffy/mod.ts or directly from the command module https://deno.land/x/cliffy/command.ts.

The `Command` class is used to create a new command or sub-command.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .description( 'Example description ...' )
    .parse( Deno.args );
```

```textile
$ ./examples/command/creating-a-program.ts help

  Usage:   creating-a-program.ts
  Version: v0.0.1

  Description:

    Example description ...

  Options:

    -h, --help     [arg:boolean]  - Show this help.
    -V, --version  [arg:boolean]  - Show the version number for this program.

  Commands:

    help         [command:string]  - Show this help.
    completions                    - Generate shell completions for zsh and bash.
```

## Options

Options are defined with the `.option()` method. Each option can have multiple short flag's (single character) and long name's, separated by a comma.

The options can be accessed as properties on the options object passed to the `.action()` handler and return by the `.parse()` method. Multi-word options such as `--template-engine` are camel-cased, becoming `options.templateEngine` etc. Multiple short flags may be combined as a single arg, for example `-abc` is equivalent to `-a -b -c`.

### Common option types: boolean, number and string

There are three pre defined option types: a `boolean` flag, a `number` and a `string` option which can take a value (declared using angle or square brackets). All are undefined unless specified on command line or as default value.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = await new Command()
    // boolean with optional value
    .option( '-d, --debug', 'output extra debugging.' )
    // boolean with optional value
    .option( '-s, --small [small:boolean]', 'Small pizza size.' )
    // string with required value
    .option( '-p, --pizza-type <type>', 'Flavour of pizza.' )
    // string with required value
    .option( '-n, --notes <note:string>', 'Notes.' )
    // number with required value
    .option( '-a, --amount <amount:number>', 'Pieces of pizza.' )
    // parse arguments
    .parse( Deno.args );

if ( options.debug ) {
    console.log( options );
}

console.log( 'pizza details:' );

if ( options.small ) {
    console.log( '- small pizza size' );
}

if ( options.pizzaType ) {
    console.log( `- ${ options.pizzaType }` );
}

if ( options.amount ) {
    console.log( '- %s pieces', options.amount );
}

if ( options.notes ) {
    console.log( '- notes: %s', options.notes );
}
```

```
$ ./examples/command/common-option-types.ts -d
{ debug: true, small: undefined, pizzaType: undefined }
pizza details:

$ ./examples/command/common-option-types.ts -p
Error: Missing value for option: --pizza-type

$ ./examples/command/common-option-types.ts -ds -p vegetarian
{ debug: true, small: true, pizzaType: 'vegetarian' }
pizza details:
- small pizza size
- vegetarian

$ ./examples/command/common-option-types.ts --pizza-type cheese --amount 2 --notes "notes ..."
{ pizzaType: "cheese", amount: 2, notes: "notes ...", debug: true }
pizza details:
- cheese
- 2 pieces
- notes: notes ...
```

`cmd.parse(Deno.args)` processes the arguments, leaving any options consumed by the command in the `options` object and all arguments in the `args` array. For all unknown options the command will throw an error message and exit the program with `Deno.exit(1)`.

### List option types

Each type of option's can be a list of comma seperated items. The default seperator is a `,` and can be changed with the `separator` option.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = await new Command()
    // comma separated list
    .option( '-l, --list <items:number[]>', 'comma separated list of numbers.' )
    // space separated list
    .option( '-o, --other-list <items:string[]>', 'comma separated list of strings.', { separator: ' ' } )
    .parse( Deno.args );

console.log( options );
```

```
$ ./examples/command/03-list-option-type.ts -l 1,2,3
{ list: [1, 2, 3] }

$ ./examples/command/03-list-option-type.ts -o "1 2 3"
{ list: [1, 2, 3] }
```

### Custom option types

You can also extend the command with custom option type's.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const email = (): ITypeHandler<string> => {
    
    const emailRegex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return ( option: IFlagOptions, arg: IFlagArgument, value: string | false ): string | undefined => {

        if ( value ) {
            if ( !emailRegex.test( value.toLowerCase() ) ) {
                throw new Error( `Option --${ option.name } must be of type email but got: ${ value }` );
            }
            return value;
        }
    };
};

// Register email as global type:
Command.type( 'email', email() );

const { options } = await new Command()
    // Register email as command specific type:
    .type( 'email', email() )
    .option( '-e, --email <value:email>', 'Your email address.' )
    .parse( Deno.args );

console.log( options );
```

```
$ ./examples/command/custom-option-type.ts -e my@email.de
{ email: "my@email.de" }
```

```
$ ./examples/command/custom-option-type.ts -e "my @email.de"
Option --email must be a valid email but got: my @email.de
```

### Variadic options

The last argument of an option can be variadic, and only the last argument. To make an argument variadic you append ... to the argument name. For example:

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .option( '-d, --dir  [otherDirs...:string]' )
    .parse( Deno.args );

console.log( options );
```

The variadic option is returned as an array.

```
$ ./examples/command/variadic-options.ts -d dir1 dir2 dir3
{ dir: [ "dir1", "dir2", "dir3" ] }
```

### Default option value

You can specify a default value for an option with an optional value.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = new Command()
    .option( '-c, --cheese [type:string]', 'add the specified type of cheese', { default: 'blue' } )
    .parse( Deno.args );

console.log( `cheese: ${options.cheese}` );
```

```
$ ./examples/command/default-option-value.ts
cheese: blue

$ ./examples/command/default-option-value.ts --cheese mozzarella
cheese: mozzarella
```

### Required options

You may specify a required (mandatory) option.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .allowEmpty( false )
    .option( '-c, --cheese [type:string]', 'pizza must have cheese', { required: true } )
    .parse( Deno.args );
```

```
$ ./examples/command/required-options.ts
Error: Missing required option: --cheese
```

### Negatable options

You can call the long name from an option with a boolean or an optional value (declared using square brackets) with a leading `--no-` to set the option value to false when used.

You can specify a default value for the flag and it can be overridden on command line.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = await new Command()
    .option( '--sauce [sauce:boolean]', 'Remove sauce', { default: true } )
    .option( '--cheese [flavour:string]', 'cheese flavour', { default: 'mozzarella' } )
    .parse( Deno.args );

const sauceStr = options.sauce ? 'sauce' : 'no sauce';
const cheeseStr = ( options.cheese === false ) ? 'no cheese' : `${ options.cheese } cheese`;

console.log( `You ordered a pizza with ${ sauceStr } and ${ cheeseStr }` );
```

```
$ ./examples/command/negatable-options.ts
You ordered a pizza with sauce and mozzarella cheese

$ ./examples/command/negatable-options.ts --cheese
You ordered a pizza with sauce and mozzarella cheese

$ ./examples/command/negatable-options.ts --sauce
You ordered a pizza with sauce and mozzarella cheese

$ ./examples/command/negatable-options.ts --cheese blue
You ordered a pizza with sauce and blue cheese

$ ./examples/command/negatable-options.ts --no-sauce --no-cheese
You ordered a pizza with no sauce and no cheese

$ ./examples/command/negatable-options.ts --cheese parmesan
You ordered a pizza with sauce and parmesan cheese
```

### Options which depends on other options

Some options can not be call without other options. You can specify depending options with the `requires` option.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = await new Command()
    .option( '-a, --audio-codec <type:string>', 'description ...' )
    .option( '-v, --video-codec <type:string>', 'description ...', { requires: [ 'audio-codec' ] } )
    .parse( Deno.args );

console.log( options );
```

```
$ ./examples/command/dependend-options.ts -a aac
{ audioCodec: "mp3" }

$ ./examples/command/dependend-options.ts -v x265
Error: Option --video-codec depends on option: --audio-codec

$ ./examples/command/dependend-options.ts -a aac -v x265
{ audioCodec: "mp3", videoCodec: "x265" }
```

### Options which conflicts with other options

Sometimes some options can not be called together. You can specify conflicting options with the `conflicts` option.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = await new Command()
    .option( '-f, --file <file:string>', 'read from file ...' )
    .option( '-i, --stdin [stdin:boolean]', 'read from stdin ...', { conflicts: [ 'file' ] } )
    .parse( Deno.args );

console.log( options );
```

```
$ ./examples/command/conflicting-options.ts -f file1
{ file: "file1" }

$ ./examples/command/conflicting-options.ts -i
{ stdin: true }

$ ./examples/command/conflicting-options.ts -f file1 -i
Error: Option --stdin conflicts with option: --file

$ ./examples/command/conflicting-options.ts -if file1
Error: Option --stdin conflicts with option: --file
```

### Custom option processing

You may specify a function to do custom processing of option values. The callback function receives one parameter, the user specified parsed value (string|number|boolean) and it returns the new value for the option.

This allows you to coerce the option value to the desired type, or accumulate values, or do entirely custom processing.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options } = await new Command()
    .option( '-f, --float <value:number>', 'float argument' )
    .option( '-i, --integer <value:number>', 'integer argument' )
    .option( '-v, --variadic <value...:string>', 'repeatable value' )
    .option( '-l, --list <items:string[]>', 'comma separated list' )
    .option( '-o, --object <item:string>', 'map string to object', ( value: string ): { value: string } => {
        return { value };
    } )
    .option( '-c, --color <item:string>', 'map string to object', {
        collect: true,
        value: ( value: string, previous: string[] = [] ): string[] => {

            if ( [ 'blue', 'yellow', 'red' ].indexOf( value ) === -1 ) {
                throw new Error( `Color must be one of blue, yellow or red but got: ${ value }` );
            }

            previous.push( value );

            return previous;
        }
    } )
    .parse( Deno.args );

console.log( options );
```

```
$ ./examples/command/custom-option-processing.ts -f 1e2
{ float: 100 }

$ ./examples/command/custom-option-processing.ts --integer 2
{ integer: 2 }

$ ./examples/command/custom-option-processing.ts -c a b c
{ collect: [ "a", "b", "c" ] }

$ ./examples/command/custom-option-processing.ts --list x,y,z
{ list: [ "x", "y", "z" ] }

$ ./examples/command/custom-option-processing.ts --object a
{ object: { value: "a" } }

$ ./examples/command/custom-option-processing.ts --color blue --color yellow --color red
{ color: [ "blue", "yellow", "red" ] }
```

### Standalone options

Standalone options cannot be combine with any command and option. For example the `--help` and `--version` flag. You can achieve this with the `standalone` option.

```
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .option( '-s, --standalone [value:boolean]', 'Some standalone option.', { standalone: true } )
    .option( '-o, --other [value:boolean]', 'Some other option.' )
    .parse( Deno.args );
```

```
$ ./examples/command/standalone-option.ts --standalone --other
Error: Option --standalone cannot be combined with other options.
```

### Specify an action for an option

```
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .option( '-i, --info [arg:boolean]', 'Print some info.', {
        standalone: true,
        action: () => {
            console.log( 'Some info' );
            Deno.exit( 0 );
        }
    } )
    .parse( Deno.args );
```

## Commands

### Action handler

The action handler is called when the command is executed. It gets passed an object with all options defined by the user and additional arguments which are passed to the command.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .command( 'rm <dir>' )
    .option( '-r, --recursive [recursive:boolean]', 'Remove recursively' )
    .action( ( { recursive }: IFlags, dir: string ) => {
        console.log( 'remove ' + dir + ( recursive ? ' recursively' : '' ) );
    } )
    .parse( Deno.args );
```

### Sub-commands

You can specify sub-commands using the `.command()` method. There are three ways these can be implemented:

* Using an action handler attached to the command.

* Passing an `Command` instance as second parameter to the `.command()` method.

* or as a separate executable file by passing the description as second argument to the `.command()` method.

In the first parameter to `.command()` you specify the command name and any command arguments. The arguments may be `<required>` or `[optional]`, and the last argument may also be variadic.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

// Sub-command implemented using action handler (description is supplied separately to `.command()`)
await new Command()
    .command( 'clone <source:string> [destination:string]' )
    .description( 'Clone a repository into a newly created directory.' )
    .action( ( source: string, destination: string ) => {
        console.log( 'clone command called' );
    } )
    .parse( Deno.args );

// Sub-command implemented using a command instance as second parameter.
await new Command()
    .command( 'clone', new Command()
    .arguments( '<source:string> [destination:string]' )
    .description( 'Clone a repository into a newly created directory.' )
    .action( ( source: string, destination: string ) => {
        console.log( 'clone command called' );
    } ) )
    .parse( Deno.args );

// Command implemented using separate executable file (description is passes as second parameter to `.command()`)
await new Command()
    .command( 'start <service>', 'Start named service.' )
    .command( 'stop [service]', 'Stop named service, or all if no name supplied.' )
    .parse( Deno.args );
```

### Specify the argument syntax

You can use `.arguments()` to specify the arguments for the top-level command and for sub-commands. For sub-commands they can also be included in the `.command()` call. Angled brackets (e.g. `<required>`) indicate required input and square brackets (e.g. `[optional]`) indicate optional input. A required input can not be defined after a optional input.

* `[name:type]` optional value.
* `<name:type>` required value.
* `[name...:type]` optional variadic values.
* `<name...:type>` optional variadic values with a minimum of one requried value.

The name can be any name. It is only printed in the help.

The type can be one of:

* `string`
* `boolean`
* `number`

or any [custom type](#custom-option-types).

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

const { options, args } = await new Command()
    .version( '0.1.0' )
    .arguments( '<cmd:string> [env:string] [dirs...:string]' )
    .parse( Deno.args );

console.log( 'command:', args[0] );
console.log( 'environment:', args[1] || "no environment given");
console.log( 'directories:', args[2] || "no directories given");
```

The last argument of a command can be variadic, and only the last argument. To make an argument variadic you append `...` to the argument name. The variadic argument is passed to the action handler as an array.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .command( 'rmdir <dirs...:string>' )
    .action( ( options: IFlags, dirs: string[] ) => {
        dirs.forEach( ( dir: string ) => {
            console.log( 'rmdir %s', dir );
        } );
    } )
    .parse( Deno.args );
```

### Git-style executable sub-commands

When `.command()` is invoked with a description argument, this tells cliffy that you're going to use separate executables for sub-commands, much like `git(1)` and other popular tools. Cliffy will search the executables in the directory of the entry script (like `./examples/pm`) with the name program-sub-command, like `pm-install`, `pm-search`. You can specify a custom name with the `executable` configuration option.

You handle the options for an executable (sub)command in the executable, and don't declare them at the top-level.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .command( 'install [name]', 'install one or more packages' )
    .command( 'search [query]', 'search with optional query' )
    .command( 'update', 'update installed packages', { executable: 'myUpdateSubCommand' } )
    .command( 'list', 'list packages installed' )
    .parse( Deno.args );
```

### Override exit handling

By default cliffy calls `Deno.exit` when it detects errors. You can override this behaviour with the `.throwErrors()` method.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

try {
    await new Command()
        .throwErrors()
        .version( '0.1.0' )
        .option( '-p, --pizza-type <type>', 'Flavour of pizza.' )
        .parse( Deno.args );
} catch ( err ) {
    // custom processing...
    console.error( '[CUSTOM_ERROR]', err );
}
```

```textile
$ ./examples/command/override-exit-handling.ts -t
[CUSTOM_ERROR] Error: Unknown option: -t
    at parseFlags (flags.ts:93:27)
    at Command.parseFlags (base-command.ts:522:20)
    at Command.parse (base-command.ts:421:45)
    at 17-override-exit-handling.ts:10:10
```

Make sure the executables have proper modes, like `755`.


### Environment variables

You can define environment variabels for a command which will be validated when the command is executed.
All environment variables will be shown with the [help](#help-option-and-command) option and command.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .env( 'SOME_ENV_VAR=<value:number>', 'Description ...' )
    .parse( Deno.args );

console.log( Deno.env().SOME_ENV_VAR );    
```

```
$ SOME_ENV_VAR=1 ./examples/command/environment-variables.ts
1

$ SOME_ENV_VAR=abc ./examples/command/environment-variables.ts
Error: Environment variable 'SOME_ENV_VAR' must be of type number but got: abc
```

### Specify examples

You can add some examples for your command which will be printed with the [help](#help-option-and-command) option and command.

```typescript
#!/usr/bin/env -S deno --allow-env

import { red } from 'https://deno.land/std/fmt/colors.ts';
import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .examples( 'example name', `Description ...\n\n Can have mutliple lines and ${ red( 'colors' ) }.` )
    .parse( Deno.args );
```

```
$ ./examples/command/examples.ts help

  Usage:   examples.ts
  Version: v0.0.0

  Description:

    No description ...

  Options:

    -h, --help     [arg:boolean]  - Show this help.
    -V, --version  [arg:boolean]  - Show the version number for this program.

  Commands:

    help         [command:string]  - Show this help.
    completions                    - Generate shell completions for zsh and bash.

  Examples:

    Example name:
                  Description ...

                  Can have mutliple lines and colors.

```

## Default options & commands

Every instance of the `Command` class has some pre defenied options and sub-commands. If you don't need these pre defined option's and sub-command's you can use the `BaseCommand` class instedd of the `Command` class.

### Version option

The `--version` and `-V` option flag prints the version number defined with the `version()` method. The version number will also be printed within the output of the [help](#help-option-command) option and command.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .parse( Deno.args );
```
```
$ ./examples/command/version-options.ts -V
$ ./examples/command/version-options.ts --version
0.0.1
```

### Help option & command

The help information is auto-generated based on the information you have defined on your program.

```typescript
#!/usr/bin/env -S deno --allow-env

import { Command } from 'https://deno.land/x/cliffy/command.ts';

await new Command()
    .version( '0.1.0' )
    .description( 'Sample description ...' )
    .env( 'EXAMPLE_ENVIRONMENT_VARIABLE=<value:boolean>', 'Environment variable description ...' )
    .example( 'Some example', 'Example content ...\n\nSome more example content ...' )
    .parse( Deno.args );
```

The `--help` and `-h` option flag and also the `help` sub-command prints the auto generated help.

```
$ ./examples/command/help-option-and-command.ts -h
$ ./examples/command/help-option-and-command.ts --help
$ ./examples/command/help-option-and-command.ts help

  Usage:   help-option-and-command.ts
  Version: v0.1.0

  Description:

    Sample description ...

  Options:

    -h, --help     [arg:boolean]  - Show this help.
    -V, --version  [arg:boolean]  - Show the version number for this program.

  Commands:

    help         [command:string]  - Show this help or the help of a sub-command.
    completions                    - Generate shell completions for zsh and bash.

  Environment variables:

    EXAMPLE_ENVIRONMENT_VARIABLE <value:boolean> - Environment variable description ...

  Examples:

    Some example:
                  Example content ...

                  Some more example content ...

```

The `help` sub-command excepts also a name of a sub-command as argument to show the help of the sub-command. But you can also use the help flag and command directly from the sub-command.

```
$ ./examples/command/help-option-and-command.ts help completions
$ ./examples/command/help-option-and-command.ts completions -h
$ ./examples/command/help-option-and-command.ts completions --help
$ ./examples/command/help-option-and-command.ts completions help

  Usage:   completions
  Version: v0.0.0

  Description:

    Generate shell completions for zsh and bash.

    Bash completions:

    To enable bash completions for this program add following line to your ~/.bashrc.

        source <(command-name completions bash)

    Zsh completions:

    To enable zsh completions for this program add following line to your ~/.zshrc.

        source <(command-name completions zsh)

  Options:

    -h, --help     [arg:boolean]  - Show this help.
    -V, --version  [arg:boolean]  - Show the version number for this program.

  Commands:

    help  [command:string]  - Show this help or the help of a sub-command.
    zsh                     - Generate zsh shell completions.
    bash                    - Generate bash shell completions.

```

### Completions command

The `completions` command prints an autogenerated completion script for bash and zsh shell.

To get autocompletion's to work you have to add following line to your `~/.bashrc` or `~/.zshrc` or what ever you use:

**Bash Completions**

> ~/.bashrc

```shell script
source <(command-name completions bash)
```

**Zsh Completions**

> ~/.zshrc

```shell script
source <(command-name completions zsh)
```

## License

[MIT](LICENSE)
