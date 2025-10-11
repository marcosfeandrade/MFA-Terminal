# Changelog

## [0.2.0] - 2025-10-11

### 🎉 Nova Funcionalidade Principal

- **Suporte a Splits e Grupos de Terminais**
  - Organize terminais em grupos - terminais do mesmo grupo ficam lado a lado (splitados)
  - Ao carregar perfis, a estrutura de grupos é preservada perfeitamente
  - 3 modos de organização:
    - Cada terminal separado
    - Todos splitados juntos
    - Organização manual personalizada

### ✨ Funcionalidades

- **Interface de organização de grupos**: Nova interface interativa para definir quais terminais ficam juntos
- **Migração automática**: Perfis antigos são automaticamente migrados para o novo formato
- **Visualização de grupos**: A interface mostra quantos terminais e grupos cada layout tem
- **Seleção múltipla**: Organize manualmente selecionando vários terminais por grupo

### 🏗️ Mudanças na Arquitetura

- **Novo formato de armazenamento v2.0**: Perfis agora armazenam estrutura de grupos
- **Tipos atualizados**: 
  - `TerminalGroup`: Representa um grupo de terminais splitados
  - `TerminalConfig`: Agora inclui `groupId` e `indexInGroup`
  - `TerminalProfile`: Agora usa `groups` em vez de `terminals`
- **Backwards compatibility**: Perfis antigos continuam funcionando

### 🔧 Melhorias Técnicas

- Criação de terminais com `parentTerminal` para fazer split correto
- Função `organizeTerminalsIntoGroups` com interface completa
- Função `organizeTerminalsManually` para organização detalhada
- Migração automática de perfis no `deserializeProfile`

## [0.1.1] - 2025-10-11

### 🐛 Correções

- **Resolução de caminhos**: Caminhos relativos (ex: `./teste`) agora são resolvidos corretamente em relação ao workspace
- **Validação de diretórios**: Verifica se o diretório existe antes de criar o terminal
- **Mensagens de erro**: Mensagens mais claras quando um diretório não existe
- **Fallback inteligente**: Se o diretório não existir, o terminal é criado no diretório padrão em vez de falhar

### 📚 Documentação

- Adicionado **USAGE_GUIDE.md** com guia detalhado de uso
- Atualizado **README.md** com informações sobre uso de caminhos
- Exemplos práticos de configuração de caminhos relativos e absolutos

## [0.1.0] - 2025-10-11

### ✨ Funcionalidades Implementadas

- **Gerenciamento de Perfis de Terminal**
  - Salvar layout atual de terminais como layout
  - Carregar e aplicar perfis salvos
  - Criar perfis personalizados com assistente interativo
  - Editar perfis existentes (nome, descrição, layout)
  - Deletar perfis
  - Listar todos os perfis com interface amigável

- **Configuração de Terminais**
  - Nome personalizado para cada terminal
  - Comando automático ao criar terminal
  - Diretório de trabalho customizável
  - Suporte a variáveis de ambiente (estrutura preparada)

- **Armazenamento**
  - Persistência de perfis no armazenamento global do VS Code
  - Versionamento do formato de dados
  - Serialização/deserialização automática de datas

- **Interface do Usuário**
  - 6 comandos disponíveis na paleta de comandos
  - QuickPick interativo para seleção de perfis
  - Mensagens informativas e de erro amigáveis
  - Ícones para cada comando
  - Validação de entrada do usuário

### 📚 Arquitetura

- **Modular**: Código dividido em módulos especializados
  - `types.ts`: Definições de tipos TypeScript
  - `profileStorage.ts`: Serviço de armazenamento
  - `terminalManager.ts`: Gerenciamento de terminais
  - `extension.ts`: Ponto de entrada e comandos

- **Orientado a Serviços**: Separação clara de responsabilidades
- **Type-Safe**: Uso completo de TypeScript com tipagem forte
- **Extensível**: Estrutura preparada para funcionalidades futuras

### 📝 Documentação

- README completo com:
  - Guia de uso passo a passo
  - Lista de comandos
  - Casos de uso
  - Roadmap de funcionalidades

## [0.0.1] - Data inicial

### Inicial
- Estrutura básica da extensão criada
