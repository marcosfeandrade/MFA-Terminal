# 🧪 Guia de Testes - MFA Terminal

## Como Testar a Funcionalidade de Splits

### Preparação

1. **Inicie a extensão em modo debug**:
   - Pressione `F5` no VS Code
   - Isso abrirá uma nova janela com a extensão ativa

### Teste 1: Criar Perfil com Terminais Splitados

#### Passo a Passo:

1. **Abra a paleta de comandos**: `Ctrl+Shift+P`
2. **Execute**: `MFA Terminal: Criar Novo Perfil`
3. **Adicione 3 terminais**:
   - Terminal 1: "Frontend" - comando: `echo "Frontend"` - dir: `./`
   - Terminal 2: "Backend" - comando: `echo "Backend"` - dir: `./`
   - Terminal 3: "Database" - comando: `echo "Database"` - dir: `./`
4. **Quando perguntar como organizar**, escolha: "Organizar manualmente"
5. **Grupo 1**: Selecione "Frontend" e "Backend" (Ctrl+Click para múltipla seleção)
6. **Continue**: Escolha "Finalizar"
7. **Digite o nome**: "Dev Full Stack"
8. **Adicione descrição**: "Frontend e Backend lado a lado, Database separado"

#### Resultado Esperado:
- Mensagem: "✅ Perfil 'Dev Full Stack' criado! 3 terminal(is) em 2 grupos."

### Teste 2: Carregar Perfil com Splits

#### Passo a Passo:

1. **Abra a paleta de comandos**: `Ctrl+Shift+P`
2. **Execute**: `MFA Terminal: Carregar Perfil`
3. **Selecione**: "Dev Full Stack"
4. **Escolha**: "Manter terminais existentes" ou "Fechar terminais existentes"

#### Resultado Esperado:
- **Grupo 1**: Frontend e Backend devem aparecer lado a lado (splitados)
- **Grupo 2**: Database deve aparecer em um painel separado
- Mensagem: "✅ Perfil 'Dev Full Stack' aplicado! 3 terminal(is) em 2 grupos."

### Teste 3: Salvar Layout Atual

#### Passo a Passo:

1. **Abra 2 terminais manualmente**
2. **Abra a paleta de comandos**: `Ctrl+Shift+P`
3. **Execute**: `MFA Terminal: Salvar Perfil Atual`
4. **Escolha organização**: 
   - Opção A: "Cada terminal em seu próprio grupo" (2 terminais separados)
   - Opção B: "Todos splitados em um grupo" (2 terminais lado a lado)
   - Opção C: "Organizar manualmente" (você escolhe)
5. **Digite o nome e descrição**

#### Resultado Esperado:
- Perfil salvo com a estrutura escolhida
- Ao carregar novamente, deve manter a mesma organização

### Teste 4: Todos os Modos de Organização

#### Modo: Cada Terminal Separado

```
Organização escolhida: "Cada terminal em seu próprio grupo"
3 terminais → 3 grupos

Resultado Visual:
[Terminal 1]
[Terminal 2]
[Terminal 3]
```

#### Modo: Todos Splitados

```
Organização escolhida: "Todos splitados em um grupo"
3 terminais → 1 grupo

Resultado Visual:
[Terminal 1 | Terminal 2 | Terminal 3]
```

#### Modo: Manual

```
Organização personalizada:
- Grupo 1: Terminal 1 + Terminal 2
- Grupo 2: Terminal 3

Resultado Visual:
[Terminal 1 | Terminal 2]
[Terminal 3]
```

### Teste 5: Editar Perfil

#### Passo a Passo:

1. **Execute**: `MFA Terminal: Editar Perfil`
2. **Selecione um perfil**
3. **Escolha**: "Atualizar com layout atual"
4. **Abra alguns terminais**
5. **Reorganize** usando a interface de grupos

#### Resultado Esperado:
- Perfil atualizado com novo layout
- Ao carregar, deve usar o novo layout

### Teste 6: Listar Perfis

#### Passo a Passo:

1. **Execute**: `MFA Terminal: Listar Perfis`
2. **Observe**: Cada perfil mostra "X terminal(is) em Y grupos"

#### Resultado Esperado:
- Informação clara sobre estrutura de cada perfil
- Exemplo: "3 terminal(is) em 2 grupos"

### Teste 7: Migração de Perfis Antigos

Se você tinha perfis da versão 0.1.x:

#### Resultado Esperado:
- Perfis antigos continuam funcionando
- São automaticamente migrados para o formato novo
- Todos os terminais ficam em um único grupo (sem splits)

## ✅ Checklist de Testes

- [ ] Criar perfil com 3 terminais, 2 splitados e 1 separado
- [ ] Carregar perfil e verificar layout de splits
- [ ] Salvar layout atual com "todos splitados"
- [ ] Salvar layout atual com "todos separados"
- [ ] Salvar layout atual com organização manual
- [ ] Editar perfil existente e atualizar layout
- [ ] Verificar se listagem mostra informação de grupos
- [ ] Criar perfil com apenas 1 terminal (deve criar 1 grupo)
- [ ] Criar perfil com 5+ terminais e organizar manualmente
- [ ] Deletar perfil

## 🐛 Problemas Conhecidos Durante Testes

Se encontrar problemas:

1. **Terminais não aparecem splitados**:
   - Verifique se o perfil tem múltiplos terminais no mesmo grupo
   - Recarregue a janela do VS Code (`Developer: Reload Window`)

2. **Erro ao carregar perfil antigo**:
   - Perfis antigos devem ser migrados automaticamente
   - Se não funcionar, delete e recrie o perfil

3. **Interface de organização não aparece**:
   - Certifique-se de que tem mais de 1 terminal
   - Com 1 terminal, automaticamente cria 1 grupo

## 📝 Feedback

Após os testes, documente:
- ✅ O que funcionou perfeitamente
- ⚠️ O que precisa de ajustes
- 💡 Sugestões de melhorias

