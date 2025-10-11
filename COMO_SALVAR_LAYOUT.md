# 📖 Como Salvar Layout de Terminais com Splits

## ⚠️ IMPORTANTE - Leia Antes de Usar

A API do VS Code **NÃO** fornece informações sobre quais terminais estão splitados. Por isso, quando você salva um perfil, **você precisa informar manualmente** quais terminais estavam lado a lado.

## 🎯 Seu Cenário

Você tem:
```
[s1 | s2]  ← splitados (lado a lado)
[t1]       ← separado
```

## 📝 Passo a Passo Correto

### 1. Salvar o Perfil

Execute: `MFA Terminal: Salvar Perfil Atual`

### 2. Digite o Nome do Perfil

- Você verá: `Salvando terminais: s1, s2, t1 | Digite o nome do perfil`
- Digite: "Meu Layout" (ou qualquer nome)
- Pressione Enter

### 3. **⚠️ ETAPA CRUCIAL** - Definir Estrutura de Splits

Agora a extensão vai perguntar **COMO ESSES TERMINAIS ESTAVAM ORGANIZADOS**:

#### Opção A: "Organizar manualmente os splits" ← **ESCOLHA ESTA**

1. **Grupo 1** - Selecione os terminais que estavam LADO A LADO:
   - Clique em `s1`
   - Segure `Ctrl` e clique em `s2`
   - Pressione Enter
   
2. **Continue**: Escolha "Finalizar (criar grupos individuais para o restante)"
   - Isso criará `t1` separado automaticamente

#### Resultado Final:
```
Grupo 1: s1, s2  → Serão recriados lado a lado
Grupo 2: t1      → Será recriado separado
```

### 4. Adicione Descrição (opcional)

- Digite algo como: "Layout com s1 e s2 splitados"
- Ou deixe em branco

### 5. Perfil Salvo! ✅

Agora quando você carregar o perfil, ele vai recriar:
```
[s1 | s2]  ← lado a lado
[t1]       ← separado
```

## 🔄 Para Carregar

Execute: `MFA Terminal: Carregar Perfil`
- Selecione "Meu Layout"
- Os terminais serão criados exatamente como você definiu!

## 💡 Dicas

### Se seus terminais estão assim:
```
[s1 | s2]
[t1]
```

**Escolha**: "Organizar manualmente"
- Grupo 1: Selecione s1 e s2
- Grupo 2: t1 (automático)

### Se seus terminais estão assim:
```
[s1]
[s2]
[t1]
```

**Escolha**: "Cada terminal separado"

### Se seus terminais estão assim:
```
[s1 | s2 | t1]
```

**Escolha**: "Todos splitados (lado a lado)"

## ❓ Por Que Isso É Necessário?

O VS Code não fornece uma API para detectar automaticamente quais terminais estão splitados. A única forma é você informar manualmente como eles estavam organizados.

Pense nisso como: **"Eu capturo os NOMES, você define a ESTRUTURA"**

## 🎬 Exemplo Completo

```
Seus terminais atuais:
━━━━━━━━━━━━━━━━━━━━━
│  s1    │    s2      │  ← Splitados
━━━━━━━━━━━━━━━━━━━━━
│       t1            │  ← Separado
━━━━━━━━━━━━━━━━━━━━━

1. Salvar Perfil → Nome: "Dev Layout"
2. Organizar → Escolhe "Manual"
3. Grupo 1 → Seleciona s1 e s2 (Ctrl+Click)
4. Finalizar → t1 fica sozinho

Resultado salvo:
- Grupo 1: [s1, s2]
- Grupo 2: [t1]

Ao carregar:
━━━━━━━━━━━━━━━━━━━━━
│  s1    │    s2      │  ← Recriados lado a lado!
━━━━━━━━━━━━━━━━━━━━━
│       t1            │  ← Recriado separado!
━━━━━━━━━━━━━━━━━━━━━
```

## ✅ Fluxo Resumido

1. `Salvar Perfil Atual`
2. Nome do perfil: "Meu Layout"
3. **Organizar splits**: Manual → Grupo 1: s1+s2, Grupo 2: t1
4. Descrição (opcional)
5. **Carregar Perfil** → "Meu Layout"
6. Terminais recriados na estrutura correta! 🎉

